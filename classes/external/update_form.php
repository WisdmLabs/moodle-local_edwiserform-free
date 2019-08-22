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

namespace local_edwiserform\external;

defined('MOODLE_INTERNAL') || die();

use external_function_parameters;
use external_value;
use context_system;

trait update_form {

    /**
     * Describes the parameters for update form
     * @return external_function_parameters
     * @since  Edwiser Forms 1.0.5
     */
    public static function update_form_parameters() {
        return self::get_create_update_form_parameters(true);
    }

    /**
     * Creating new form using form definition and settings.
     * @param  array $settings The settings of form including id, title, description, data_edit, type,
     *                         notifi_email, message, draftitemid
     * @param  string $formdef json string of form definition
     * @return array  [status, msg, formid] of form creation process
     * @since  Edwiser Form 1.0.0
     */
    public static function update_form($settings, $formdef) {
        global $CFG;
        require_once($CFG->dirroot . "/local/edwiserform/lib.php");
        $responce = array(
            'status' => false,
            'msg' => get_string("efb-form-setting-update-fail-msg", "local_edwiserform"),
        );
        $type = self::getarrayval($settings, "type");
        $formid = self::getarrayval($settings, "id");
        $eventsettings = self::getarrayval($settings, "eventsettings");
        $params = self::validate_parameters(self::update_form_parameters(), array("setting" => $settings, "formdef" => $formdef));
        $settings = self::getarrayval($params, 'setting');
        $formid = self::getarrayval($settings, "id");
        $formdefinition = self::getarrayval($params, 'formdef');
        $responce["formid"] = $formid;
        $formsettings = self::get_form_settings($settings);
        $status = self::update_form_status($formid, $formdefinition, $formsettings);
        if ($status == true) {
            $responce['status'] = true;
            $responce['msg'] = get_string("efb-form-setting-update-msg", "local_edwiserform");
        } else if ($status == false) {
            $responce['msg'] = get_string("efb-form-def-update-fail-msg", "local_edwiserform");
        } else {
            $responce['msg'] = $status;
        }
        return $responce;
    }

    /**
     * Getting form settings from setting array and copying that in data standard class object.
     * Also saving files from email body template to plugin area and return data object
     * @param  array $setting of form admin want to update
     * @return stdClass data
     * @since  Edwiser Form 1.0.0
     */
    private static function get_form_settings($setting) {
        global $DB, $USER, $CFG;
        $data = new \stdClass();
        $data->id = self::getarrayval($setting, "id");
        $data->title = self::getarrayval($setting, "title");
        $data->description = self::getarrayval($setting, "description");
        $data->type = self::getarrayval($setting, "type");
        $data->notifi_email = self::getarrayval($setting, "notifi_email");
        $data->data_edit = self::getarrayval($setting, "data_edit", false);
        $context = context_system::instance();
        require_once($CFG->libdir . "/filelib.php");
        $data->message = file_save_draft_area_files(
            self::getarrayval($setting, "draftitemid", 0),
            $context->id,
            EDWISERFORM_COMPONENT,
            EDWISERFORM_FILEAREA,
            $data->id,
            array('subdirs' => false),
            self::getarrayval($setting, "message", "")
        );
        $data->author2 = $USER->id;
        $data->modified = time();
        return $data;
    }

    /**
     * Comparing form definition for the change in settings, stage, row, column or fields
     * @param  string $def1 previous form definition in json format
     * @param  string $def2 new form definition in json format
     * @return boolean true if form definition is same
     * @since  Edwiser Form 1.0.0
     */
    private static function compare_form_definition($def1, $def2) {
        if ($def1 != $def2) {
            $def1 = json_decode_level_2($def1);
            $def2 = json_decode_level_2($def2);
            foreach ($def1["fields"] as $key => $value) {
                if (!isset($def2["fields"][$key]) || $value != $def2["fields"][$key]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Updating form definition if new definition is different than previous
     * @param  integer $formid The form id
     * @param  $formdefinition Form definition in json format
     * @param  $formsettings Form object with settings and form definition
     * @return boolean true if form definition is updated
     * @since  Edwiser Form 1.0.0
     */
    private static function update_form_status($formid, $formdefinition, $formsettings) {
        global $DB;
        $submissions = $DB->count_records("efb_form_data", array("formid" => $formid));
        $oldform = $DB->get_field("efb_forms", "definition", array("id" => $formid));
        $overwrite = self::compare_form_definition($formdefinition, $oldform);
        $formsettings->definition = $formdefinition;
        if (!$submissions || $overwrite) {
            $DB->update_record("efb_forms", $formsettings);
            return true;
        }
        return false;
    }

    /**
     * Returns description of method parameters for update form
     * @return external_single_structure
     * @since  Edwiser Form 1.0.0
     */
    public static function update_form_returns() {
        return self::get_create_update_form_returns();
    }
}
