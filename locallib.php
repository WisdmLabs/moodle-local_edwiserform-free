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
 * Internal library of functions for module video
 *
 * All the video specific functions, needed to implement the module
 * logic, should go here. Never include this file from your lib.php!
 *
 * @package    local_edwiserform
 * @copyright  2016 Your Name <your@email.address>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/repository/lib.php');
require_once($CFG->dirroot . '/local/edwiserform/renderable.php');
require_once($CFG->dirroot . '/local/edwiserform/lib.php');
// use core_component;
/*
 * Does something really useful with the passed things
 *
 * @param array $things
 * @return object
 * function video_do_something_useful(array $things) {
 *    return new stdClass();
 * }
 */

class edwiserform {

    private $output;

    // Event plugins
    private $events = [];

    public function get_renderer()
    {
        global $PAGE;
        if ($this->output) {
            return $this->output;
        }
        $this->output = $PAGE->get_renderer('local_edwiserform');
        return $this->output;
    }

        public function parse_xml($xml) {
        $xml = simplexml_load_string($xml);
        $form = new stdClass;
        foreach ($xml as $key => $obj) {
            $form->$key = (string)$obj;
        }
        return $form;
    }

    /**
     * Load the plugins from the sub folder events
     *
     * @param string type - Type of plugin
     * @return array - The sorted list of plugins
     */
    public function get_plugin($type) {
        global $CFG;
        $result = null;

        $names = core_component::get_plugin_list('edwiserformevents');
        foreach ($names as $name => $path) {
            if ($name == $type && file_exists($path . '/locallib.php')) {
                require_once($path . '/locallib.php');
                $shortsubtype = substr('edwiserformevents', strlen('edwiserform'));
                $pluginclass = 'edwiserform_' . $shortsubtype . '_' . $name;
                $result = new $pluginclass($this, $name);
            }
        }
        return $result;
    }

    /**
     * Load the plugins from the sub folder events
     *
     * @return array - The sorted list of plugins
     */
    public function get_plugins() {
        global $CFG;
        $result = array();

        $names = core_component::get_plugin_list('edwiserformevents');
        foreach ($names as $name => $path) {
            if (file_exists($path . '/locallib.php')) {
                require_once($path . '/locallib.php');
                $shortsubtype = substr('edwiserformevents', strlen('edwiserform'));
                $pluginclass = 'edwiserform_' . $shortsubtype . '_' . $name;
                $result[$name] = new $pluginclass($this, $name);
            }
        }
        return $result;
    }

    public function view($page) {
        global $USER, $CFG, $PAGE;
        $out = "";
        can_create_or_view_form($USER->id);
        $js = [new moodle_url('https://www.google.com/recaptcha/api.js')];
        switch ($page) {
            case 'newform':
                $js[] = new moodle_url($CFG->wwwroot . '/local/edwiserform/amd/src/new-form-main.js');
                $sitekey = get_config('local_edwiserform', 'google_recaptcha_sitekey');
                $PAGE->requires->data_for_js('sitekey', $sitekey);
                $formid = optional_param('formid', null, PARAM_FLOAT);
                $out = $this->get_renderer()->render(new efb_add_new_form($formid));
                if ($formid) {
                    $page = 'editform';
                }
                break;
            case 'listforms':
                $js[] = new moodle_url($CFG->wwwroot . '/local/edwiserform/amd/src/form-list-js.js');
                $out = $this->get_renderer()->render(new efb_list_form());
                break;
            case 'viewdata':
                $formid= optional_param('formid', null, PARAM_FLOAT);
                $out = $this->get_renderer()->render(new efb_list_form_data($formid));
                break;
            case 'import':
                require_once($CFG->dirroot.'/local/edwiserform/classes/import_form.php');
                $js[] = new moodle_url($CFG->wwwroot . '/local/edwiserform/amd/src/import-form.js');
                $mform = new local_edwiserform_import_form();
                $out = $this->get_renderer()->render(new efb_import_form($mform));
                break;
        }
        foreach ($js as $jsfile) {
            $PAGE->requires->js($jsfile);
        }
        return $out;
    }
}
