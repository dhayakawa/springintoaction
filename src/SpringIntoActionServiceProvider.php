<?php

    namespace Dhayakawa\SpringIntoAction;

    use Illuminate\Support\ServiceProvider;
    use Illuminate\Foundation\AliasLoader;
    use Illuminate\Support\Facades\View;
    use Illuminate\Support\Facades\Blade;
    use Illuminate\Support\Facades\Auth;

    class SpringIntoActionServiceProvider extends ServiceProvider {

        protected $defer = false;
        protected $loader;
        protected $router;

        /**
         * Create a new SpringIntoAction service provider instance.
         *
         * @param  \Illuminate\Foundation\Application $app
         *
         * @return void
         */
        public function __construct($app) {
            $this->loader = AliasLoader::getInstance();
            $this->router = app('router');

            return parent::__construct($app);
        }

        /**
         * Bootstrap the SpringIntoAction services.
         *
         * @return void
         */
        public function boot() {
            // Publish all files when calling php artisan vendor:publish
            $this->publishes([__DIR__ . '/bootstrap' => base_path('bootstrap')]);
            $this->publishes([__DIR__ . '/Constants' => app_path('Constants/')], 'constants');
            $this->publishes([__DIR__ . '/Menu' => app_path('Menu/')], 'menu');
            $this->publishes([__DIR__ . '/config' => config_path()], 'config');
            $this->publishes([__DIR__ . '/routes' => base_path('routes/')], 'routes');
            $this->publishes([__DIR__ . '/resources' => base_path('resources/')], 'resources');
            $this->publishes([__DIR__ . '/public' => base_path('public/')], 'public');
            $this->publishes([__DIR__ . '/Models' => app_path('Models')], 'models');
            $this->publishes([__DIR__ . '/migrations' => app_path('migrations')], 'migrations');
            $this->publishes([__DIR__ . '/webpack.mix.js' => base_path('webpack.mix.js')], 'webpack');


            // If routes file has been published, load routes from the published file
            if(is_file(base_path('routes/springintoaction.php'))) {
                //$this->loadRoutesFrom(base_path('routes/boilerplate.php'));
                $this->loadRoutesFrom(base_path('routes/springintoaction.php'));
            } else {
                //$this->loadRoutesFrom(__DIR__ . '/routes/boilerplate.php');
                $this->loadRoutesFrom(__DIR__ . '/routes/springintoaction.php');
            }

            // Load migrations, views and translations from current directory
            $this->loadMigrationsFrom(__DIR__ . '/migrations');
            $this->loadViewsFrom(__DIR__ . '/resources/views/vendor/springintoaction', 'springintoaction');
            $this->loadTranslationsFrom(__DIR__ . '/resources/lang/vendor/springintoaction', 'springintoaction');

            $this->publishes([
                __DIR__ . '/resources/views/vendor/springintoaction' => resource_path('views/vendor/springintoaction'),
            ]);

            Blade::if(
                'env',
                function ($environment) {
                    return app()->environment($environment);
                }
            );
        }

        /**
         * Register the application services.
         *
         * @return void
         */
        public function register() {
            // Get config
            $this->mergeConfigFrom(__DIR__ . '/config/springintoaction/app.php', 'springintoaction.app');
            $this->mergeConfigFrom(__DIR__ . '/config/springintoaction/signup.php', 'springintoaction.signup');
            $this->mergeConfigFrom(__DIR__ . '/config/springintoaction/auth.php', 'springintoaction.auth');

            config([
                'boilerplate.app.logo-lg' => config('springintoaction.app.logo-lg', ''),
                'boilerplate.app.logo-mini' => config('springintoaction.app.logo-mini', ''),
            ]);
            $this->router->aliasMiddleware('guest', Middleware\RedirectIfAuthenticated::class);
            $this->router->aliasMiddleware('ajax.request', Middleware\CheckSessionAjaxRequests::class);
        }
    }
