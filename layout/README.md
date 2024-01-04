# Layout

The layout directory holds outer layout files for your theme. You can have multiple layouts, and specify which one to use per template. 

By default, the `theme.liquid` layout will be used sitewide except for password pages, where `password.liquid` will be used instead.

Your content renders inside the layout files at the `{{ content_for_layout }}` marker.