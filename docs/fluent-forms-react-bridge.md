# Fluent Forms React Bridge

Add this as a WordPress Code Snippets snippet. It lets the React storefront ask
WordPress to render a real Fluent Forms shortcode by form ID and submit the
filled form back into Fluent Forms.

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
