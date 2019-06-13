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
 */

namespace local_edwiserform\external;

defined('MOODLE_INTERNAL') || die();

use external_single_structure;
use external_function_parameters;
use external_value;

trait get_template {

    /**
     * Describes the parameters for get template
     * @return external_function_parameters
     * @since  Edwiser Forms 1.0.0
     */
    public static function get_template_parameters() {
        return new external_function_parameters(
                array(
            'name' => new external_value(PARAM_TEXT, 'Template name.', VALUE_REQUIRED)
            )
        );
    }

    /**
     * Fetch the template definition by the name
     * @param  string $name of the template
     * @return array  [status, definition, msg]
     * @since  Edwiser Form 1.0.0
     */
    public static function get_template($name) {
        global $DB;
        $responce = array(
            'status'     => false,
            'definition' => '',
            'msg'        => get_string("efb-template-not-found", "local_edwiserform")
        );

        // Checking for empty form template
        if (trim($name) == '') {
            $responce['msg'] = get_string("efb-template-name-not-valid", "local_edwiserform");
            return $responce;
        }

        // If template is part of pro version and license status is inactive then returning error
        $template = $DB->get_record("efb_form_templates", array("name" => $name));
        if ($template) {
            $responce['status'] = true;
            $responce['definition'] = $template->definition;
            $responce['msg'] = get_string("efb-template-found", "local_edwiserform");
        }
        return $responce;
    }

    /**
     * Returns description of method parameters for get templates
     * @return external_single_structure
     * @since  Edwiser Form 1.0.0
     */
    public static function get_template_returns() {
        return new external_single_structure(
            [
                'status'     => new external_value(PARAM_BOOL, 'Template responce status.'),
                'definition' => new external_value(PARAM_TEXT, 'Template definition'),
                'msg'        => new external_value(PARAM_TEXT, 'Template responce message')
            ]
        );
    }

}
