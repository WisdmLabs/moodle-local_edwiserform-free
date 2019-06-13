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

use external_function_parameters;
use external_value;
use html_writer;
use moodle_url;

trait get_form_definition {

    /**
     * Describes the parameters for get form definition
     * @return external_function_parameters
     * @since  Edwiser Forms 1.0.0
     */
    public static function get_form_definition_parameters() {
        return new external_function_parameters(
                array(
            'form_id' => new external_value(PARAM_INT, 'Form id found in shortcode.', VALUE_REQUIRED),
                )
        );
    }

    /**
     * Fetch form definition from database attach user's submission, common profile data and send it in response
     * @param  integer $formid if of the form
     * @return array   [status, title, definition, formtype, style, action, data, msg]
     * @since  Edwiser Form 1.0.0
     */
    public static function get_form_definition($formid) {
        global $DB, $CFG, $USER;
        $responce = array(
            'status' => false,
            'title' => '',
            'definition' => '',
            'formtype' => 'blank',
            'action' => '',
            'data' => '',
            'msg' => get_string("efb-form-not-found", "local_edwiserform", ''.$formid),
        );
        if ($formid > 0) {
            $form = $DB->get_record('efb_forms', array('id' => $formid));

            // If form id is invalid then returning false response
            if (!$form || $form->deleted) {
                return $responce;
            }

            // If form is not enabled then returning response with form not enabled message
            if (!$form->enabled) {
                $responce['msg'] = get_string("efb-form-not-enabled", "local_edwiserform", ''.$form->title);
                return $responce;
            }
            $params = array('form_id' => $formid);
            $responce["form_id"] = $formid;
            $plugin = null;
            if ($form->type != 'blank') {
                $plugin = get_plugin($form->type);
            }
            if (empty($USER->id)) {

                // Checking whether selected form type XYZ can be viewed while user is not logged in
                // If no then returning response with login to use form
                if ($form->type == 'blank' || $plugin->login_required()) {
                    $link = html_writer::link(new moodle_url($CFG->wwwroot . "/login/index.php"), get_string("efb-form-loggedin-required-click", "local_edwiserform"));
                    $responce["msg"] = get_string("efb-form-loggedin-required", "local_edwiserform", $link);
                    return $responce;
                }
            } else {

                // Checking whether selected form type XYZ can be viewed while user is logged in
                // If no then returning response with not allowed while logged in
                if ($form->type != 'blank' && !$plugin->login_allowed()) {
                    $responce["msg"] = get_string("efb-form-loggedin-not-allowed", "local_edwiserform");
                    return $responce;
                }
            }
            $responce["formtype"] = $form->type;
            $responce["title"] = $form->title;
            self::validate_form($form, $plugin, $responce);
            if ($form->type != 'blank') {

                // This feature is going to add in future update. Whether form is going to submit data to external url
                $responce['action']  = $plugin->get_action_url();
            }
        }
        return $responce;
    }

    /**
     * Validate whether whether user can submit data into form and attach previously submitted data
     * @param  stdClass $form standard class object of form with main settings
     * @param  object   $plugin object of selected form type
     * @param  array    $response reference array with [status, title, definition, formtype, action, data, msg]
     * @return array    [status, title, definition, formtype, action, data, msg]
     * @since  Edwiser Form 1.0.0
     */
    public static function validate_form($form, $plugin, &$responce) {
        global $CFG;
        $canuser = self::can_save_data($form, $plugin);
        switch ($canuser['status']) {
            case 0:
                // User previously submitted data into form but admin disabled user from re-submitting data
                $responce["msg"] = get_string("efb-form-submission-found", "local_edwiserform", $CFG->wwwroot);
                break;
            case 2:
                // User previously submitted data into form and can re-submit data to edit previous submission
                $responce["data"] = $canuser["data"];
            case 1:
                // User can submit data into form
                $responce["definition"] = $form->definition;
                $responce["msg"] = get_string("efb-form-definition-found", "local_edwiserform");
                $responce["status"] = true;
                break;
            default:
                $responce["msg"] = get_string("efb-unknown-error", "local_edwiserform");
                break;
        }
        if ($form->type != 'blank') {
            // Attaching extra data to the form data
            $responce['data'] = $plugin->attach_data($form, $responce["data"]);
        } else {
            $events = get_events_base_plugin();
            $responce['data'] = $events->attach_common_data($form, $responce["data"]);
        }
        return $responce;
    }

    /**
     * Check whether user can save data into form
     * @param  stdClass $form object of form with definition and settings
     * @param  object   $plugin object of selected event
     * @return array    [status 0-cannot submit but have data|1-can submit|2-can submit and have data,
     *                   data previous submitted data]
     * @since  Edwiser Form 1.0.0
     */
    public static function can_save_data($form, $plugin) {
        global $DB, $USER;
        $responce = ['status' => 1];
        if ($USER->id == 0) {
            return $responce;
        }
        if ($plugin != null && $plugin->support_multiple_submissions()) {
            return $responce;
        }
        $formid = $form->id;
        $sql = "SELECT f.type, f.data_edit, fd.submission FROM {efb_forms} f
                  JOIN {efb_form_data} fd ON f.id = fd.formid
                 WHERE f.id = ?
                   AND fd.userid = ?";
        $form = $DB->get_record_sql($sql, array($formid, $USER->id));
        if ($form && ($form->type == 'blank' || $plugin->can_save_data())) {
            if ($form->data_edit) {
                $responce['data'] = $form->submission;
                $responce['status'] = 2;
            } else {
                $responce['status'] = 0;
            }
        }
        return $responce;
    }

    /**
     * Returns description of method parameters for get form definition
     * @return external_single_structure
     * @since  Edwiser Form 1.0.0
     */
    public static function get_form_definition_returns() {
        return new \external_single_structure(
            [
                'status' => new external_value(PARAM_BOOL, 'Form status.'),
                'title' => new external_value(PARAM_TEXT, 'Form title'),
                'definition'    => new external_value(PARAM_RAW, 'Form data or message.'),
                'formtype' => new external_value(PARAM_TEXT, 'Form type.'),
                'action' => new external_value(PARAM_TEXT, 'Form action'),
                'data' => new external_value(PARAM_TEXT, 'Form data if previous submission present'),
                'msg' => new external_value(PARAM_RAW, 'Form definition status')
            ]
        );
    }

}
