<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package     local_edwiserform
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 * @author      Sudam
 */

defined('MOODLE_INTERNAL') || die();
$functions = [
    'edwiserform_create_new_form' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'create_new_form',
        'classpath' => '',
        'description' => 'Creates new form.',
        'type' => 'write',
        'loginrequired' => true,
        'ajax' => true,
    ],
    'edwiserform_update_form_settings' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'update_form',
        'classpath' => '',
        'description' => 'Updates the form setting and definition.',
        'type' => 'write',
        'loginrequired' => true,
        'ajax' => true,
    ],
    'edwiserform_delete_form' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'delete_form',
        'classpath' => '',
        'description' => 'Provides the functionality to delete from.',
        'type' => 'write',
        'loginrequired' => true,
        'ajax' => true,
    ],
    'edwiserform_get_form_data' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'get_form_data',
        'classpath' => '',
        'description' => 'Provides the functionality to get the form submission data',
        'type' => 'write',
        'loginrequired' => true,
        'ajax' => true,
    ],
    'edwiserform_get_form_definition' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'get_form_definition',
        'classpath' => '',
        'description' => 'Provides the functionality to get the form definition',
        'type' => 'read',
        'loginrequired' => false,
        'ajax' => true,
    ],
    'edwiserform_list_all_forms' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'get_form_list',
        'classpath' => '',
        'description' => 'Provides the list of the all the forms for the currant user.',
        'type' => 'write',
        'loginrequired' => true,
        'ajax' => true,
    ],
    'edwiserform_submit_form_data' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'submit_form_data',
        'classpath' => '',
        'description' => 'Saving data submited by form',
        'type' => 'write',
        'loginrequired' => false,
        'ajax' => true,
    ],
    'edwiserform_get_template' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'get_template',
        'classpath' => '',
        'description' => 'Returns template definition',
        'type' => 'read',
        'loginrequired' => true,
        'ajax' => true,
    ],
    'edwiserform_register_user' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'register_user',
        'classpath' => '',
        'description' => 'Registering user',
        'type' => 'write',
        'loginrequired' => false,
        'ajax' => true
    ],
    'edwiserform_enable_disable_form' => [
        'classname' => 'local_edwiserform\external\efb_api',
        'methodname' => 'enable_disable_form',
        'classpath' => '',
        'description' => 'Enable or disable form',
        'type' => 'write',
        'loginrequired' => true,
        'ajax' => true
    ]
];
