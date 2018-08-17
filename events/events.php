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
 * @package   local_edwiserform
 * @copyright WisdmLabs 2018
 * @author Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/local/edwiserform/lib.php');

class edwiserform_events_plugin {
    /**
     * Return does event require logged in user
     */
    public function login_required() {
        return false;
    }

    /**
     * Return does event require logged in user
     */
    public function login_allowed() {
        return true;
    }

    /**
     * Return action of form
     */
    public function get_action_url() {
        return '';
    }

    /**
     * Execute event action after form submission
     * @param object form
     * @param object data - submitted by user
     * @return string
     */
    public function event_action($form, $data) {
        return [
            "status" => true,
            "msg" => "",
            "errors" => "{}"
        ];
    }

    /**
     * Execute event action after form submission
     * @param object form
     * @param object data - submitted by user
     * @return object with attached event data
     */
    public function attach_data($form, $data) {
        return $data;
    }

    /**
     * Returns can user submit data for this event
     * @return boolean
     */
    public function can_save_data() {
        return true;
    }

    /**
     * Does plugin support actions on form data list view
     * @return boolean
     */
    public function support_form_data_list_actions() {
        return false;
    }

    /**
     * Validate submitted form data
     * @return array
     */
    public function validate_form_data($form, $data) {
        return [];
    }

    /**
     * Does plugin support actions on form data list view
     * @return boolean
     */
    public function form_data_list_actions($form) {
        return [];
    }

    /**
     * Form data list js files
     */
    public function form_data_list_js() {
        // Require js files or call amd
    }

    /**
     * Perform action while enabling and disabling form
     * @return object
     */

    public function enable_disable_form($form, $action, $response) {
        return $response;
    }

    /**
     * Get form settings
     */
    public function get_settings(&$mform, $form) {
        return "";
    }

    /**
     * Creating new form
     */
    public function create_new_form($formid, $settings) {
        return null;
    }

    /**
     * Update form settings
     */
    public function update_form($formid, $settings) {
        return null;
    }

    /**
     * Verify form settings
     */
    public function verify_form_settings($settings) {
        return '';
    }

    public function load_event_strings($type) {
        global $PAGE;
        $stringmanager = get_string_manager();
        $strings = $stringmanager->load_component_strings("edwiserformevents_$type", 'en');
        $PAGE->requires->strings_for_js(array_keys($strings), "edwiserformevents_$type");
    }

    public function support_form_update() {
        return true;
    }

    /**
     * Return array of templates supported by plugin
     * @return array templates
     */
    public function get_templates() {
        return [];
    }
}
