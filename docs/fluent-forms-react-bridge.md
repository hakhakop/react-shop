# Fluent Forms React Bridge

The React app may use a different WordPress installation for WooCommerce and
Fluent Forms. Set the form-owning WordPress origin explicitly:

```env
FLUENT_FORMS_SITE_URL=https://webpages.am
```

Install the snippet below on that same WordPress installation. For example, a
snippet installed on `cms.webpages.am` cannot expose a form or Pro assets that
only exist on `webpages.am`.

Add this as a WordPress Code Snippets snippet. It lets the React storefront ask
WordPress to render a real Fluent Forms shortcode by form ID, exposes the
frontend assets required by advanced fields, and submits the filled form back
into Fluent Forms. Replace the old render-only version rather than running both.

```php
add_action('rest_api_init', function () {
    register_rest_route('react-shop/v1', '/fluent-form/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => function (WP_REST_Request $request) {
            $form_id = absint($request['id']);

            if (!$form_id || !shortcode_exists('fluentform')) {
                return new WP_REST_Response([
                    'message' => 'Fluent Forms is not active or form ID is invalid.',
                ], 404);
            }

            // REST requests do not run the normal theme enqueue lifecycle.
            // Register Fluent Forms and Fluent Forms Pro frontend assets first.
            if (!did_action('wp_enqueue_scripts')) {
                do_action('wp_enqueue_scripts');
            }

            // Some Fluent Forms Pro versions register advanced field renderers
            // only during the frontend lifecycle. Without this, the saved phone
            // field remains in validation config but its HTML column is empty.
            if (
                class_exists('FluentFormPro\\Components\\PhoneField') &&
                !has_action('fluentform/render_item_phone')
            ) {
                new FluentFormPro\Components\PhoneField();
            }

            ob_start();
            echo do_shortcode('[fluentform id="' . $form_id . '"]');
            $html = ob_get_clean();

            // PhoneField adds its per-form initializer to wp_footer while the
            // shortcode is rendered. Capture only Fluent/phone-related scripts.
            ob_start();
            do_action('wp_footer');
            $footer_html = ob_get_clean();

            $scripts = [];
            $styles = [];
            $inline_scripts = [];
            $script_handles = ['jquery-core', 'intlTelInput', 'intlTelInputUtils'];
            $style_handles = [
                'fluent-form-styles',
                'fluentform-public-default',
                'intlTelInput',
            ];

            $script_registry = wp_scripts();
            foreach ($script_handles as $handle) {
                if (isset($script_registry->registered[$handle])) {
                    $src = $script_registry->registered[$handle]->src;
                    $scripts[] = strpos($src, 'http') === 0
                        ? $src
                        : site_url('/' . ltrim($src, '/'));
                }
            }

            $style_registry = wp_styles();
            foreach ($style_handles as $handle) {
                if (isset($style_registry->registered[$handle])) {
                    $src = $style_registry->registered[$handle]->src;
                    $styles[] = strpos($src, 'http') === 0
                        ? $src
                        : site_url('/' . ltrim($src, '/'));
                }
            }

            if (preg_match_all('/<script[^>]*>([\s\S]*?)<\/script>/i', $footer_html, $matches)) {
                foreach ($matches[1] as $script) {
                    if (
                        strpos($script, 'intlTelInput') !== false ||
                        strpos($script, 'ff_form_instance_' . $form_id . '_') !== false
                    ) {
                        $inline_scripts[] = $script;
                    }
                }
            }

            return new WP_REST_Response([
                'html' => $html,
                'scripts' => array_values(array_unique($scripts)),
                'styles' => array_values(array_unique($styles)),
                'inlineScripts' => $inline_scripts,
            ], 200);
        },
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('react-shop/v1', '/fluent-form/(?P<id>\d+)/submit', [
        'methods' => 'POST',
        'callback' => function (WP_REST_Request $request) {
            $form_id = absint($request['id']);
            $data = $request->get_param('data');

            if (!$form_id || !is_array($data)) {
                return new WP_REST_Response([
                    'message' => 'A valid form ID and submission data are required.',
                ], 400);
            }

            if (
                !function_exists('wpFluentForm') ||
                !class_exists('FluentForm\App\Services\Form\SubmissionHandlerService')
            ) {
                return new WP_REST_Response([
                    'message' => 'Fluent Forms submission service is not available.',
                ], 500);
            }

            $data['_wp_http_referer'] = isset($data['_wp_http_referer'])
                ? sanitize_url(urldecode($data['_wp_http_referer']))
                : '';

            try {
                wpFluentForm('request')->merge([
                    'data' => $data,
                    'form_id' => $form_id,
                ]);

                $response = (new FluentForm\App\Services\Form\SubmissionHandlerService())
                    ->handleSubmission($data, $form_id);

                return new WP_REST_Response($response, 200);
            } catch (FluentForm\Framework\Validator\ValidationException $e) {
                return new WP_REST_Response([
                    'message' => 'Please check the form fields and try again.',
                    'errors' => $e->errors(),
                ], $e->getCode() ?: 422);
            } catch (Throwable $e) {
                return new WP_REST_Response([
                    'message' => $e->getMessage(),
                ], 500);
            }
        },
        'permission_callback' => '__return_true',
    ]);
});
```

React render endpoint:

```text
/api/fluent-forms/render?formId=FORM_ID
```

React submit endpoint:

```text
/api/fluent-forms/submit
```

WordPress render endpoint:

```text
/wp-json/react-shop/v1/fluent-form/FORM_ID
```

WordPress submit endpoint:

```text
/wp-json/react-shop/v1/fluent-form/FORM_ID/submit
```

Old render-only snippet:

```php
add_action('rest_api_init', function () {
    register_rest_route('react-shop/v1', '/fluent-form/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => function (WP_REST_Request $request) {
            $form_id = absint($request['id']);

            if (!$form_id || !shortcode_exists('fluentform')) {
                return new WP_REST_Response([
                    'message' => 'Fluent Forms is not active or form ID is invalid.',
                ], 404);
            }

            ob_start();
            echo do_shortcode('[fluentform id="' . $form_id . '"]');
            $html = ob_get_clean();

            return new WP_REST_Response([
                'html' => $html,
                'scripts' => [],
                'styles' => [],
            ], 200);
        },
        'permission_callback' => '__return_true',
    ]);
});
```
