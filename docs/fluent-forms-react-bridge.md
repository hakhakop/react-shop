# Fluent Forms React Bridge

Add this as a WordPress Code Snippets snippet. It lets the React storefront ask
WordPress to render a real Fluent Forms shortcode by form ID.

```php
add_action('rest_api_init', function () {
    register_rest_route('react-shop/v1', '/fluent-form/(?P<id>\\d+)', [
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

React endpoint:

```text
/api/fluent-forms/render?formId=FORM_ID
```

WordPress endpoint:

```text
/wp-json/react-shop/v1/fluent-form/FORM_ID
```
