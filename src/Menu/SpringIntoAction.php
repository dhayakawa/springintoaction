<?php
    /**
     * Created by PhpStorm.
     * User: dhayakawa
     * Date: 2/12/2018
     * Time: 6:22 PM
     */

    namespace Dhayakawa\SpringIntoAction\Menu;

    use Sebastienheyd\Boilerplate\Menu\Builder as Builder;

    class SpringIntoAction {

        public function make(Builder $menu) {
            $menu->add(__('springintoaction::layout.sia'), ['permission' => 'sites_crud,projects_crud,volunteers_crud', 'icon' => 'child'])
                ->id('springintoaction')
                ->order(1000);

            $menu->addTo('springintoaction', __('springintoaction::layout.sia_dashboard'), ['route' => 'sia.index'])
                ->order(1010)
                ->activeIfRoute('sites.*');

            //$menu->addTo('springintoaction', __('springintoaction::layout.projects_management'), ['route' => 'projects.index', 'permission' => 'projects_crud', 'icon' => 'tasks'])
            //    ->order(1020)
            //    ->activeIfRoute('projects.*');

            //$menu->addTo('springintoaction', __(springintoaction::layout.volunteers_management'), ['route' => 'volunteers.index', 'permission' => 'volunteers_crud'])
            //    ->order(1020)
            //    ->activeIfRoute('volunteers.*');
        }
    }
