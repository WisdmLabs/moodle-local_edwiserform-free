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

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/repository/lib.php');
require_once($CFG->dirroot . '/local/edwiserform/lib.php');

use local_edwiserform\output\list_form;
use local_edwiserform\output\add_new_form;
use local_edwiserform\output\list_form_data;

class edwiserform {

    private $output;

    // Event plugins
    private $events = [];

    /**
     * Cron function to cleanup delete form, it's data and user uploaded files in the form
     *
     * @since Edwiser Form 1.1.0
     */
    public function cron() {
        global $DB;
        $forms = $DB->get_records('efb_forms', array('deleted' => true));
        foreach ($forms as $form) {
            mtrace(get_string('delete-form-data-cron-start', 'local_edwiserform', $form->id));
            $status = $DB->delete_records('efb_form_data', array('formid' => $form->id));
            $status = true;
            if ($status) {
                mtrace(get_string('delete-form-data-cron-end', 'local_edwiserform', $form->id));
            } else {
                mtrace(get_string('delete-form-data-cron-failed', 'local_edwiserform', $form->id));
            }
            mtrace(get_string('delete-form-cron-start', 'local_edwiserform', $form->id));
            $status = $DB->delete_records('efb_forms', array('deleted' => true));
            $status = true;
            if ($status) {
                mtrace(get_string('delete-form-cron-end', 'local_edwiserform', $form->id));
            } else {
                mtrace(get_string('delete-form-cron-failed', 'local_edwiserform', $form->id));
            }
        }
    }

    /**
     * Get renderer for edwiserform plugin
     *
     * @return stdClass $outpu
     * @since Edwiser Form 1.0.0
     */
    public function get_renderer() {
        global $PAGE;
        if ($this->output) {
            return $this->output;
        }
        $this->output = $PAGE->get_renderer('local_edwiserform');
        return $this->output;
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

    /**
     * Get pro feature video type links
     * @return array Video type links array
     */
    private function get_video_types() {
        return array(
            'blank'         => 'https://www.youtube.com/embed/kS4e4DvSK44',
            'enrolment'     => 'https://www.youtube.com/embed/a23TPY-p_OM',
            'login'         => 'https://www.youtube.com/embed/7opeETo_KRY',
            'registration'  => 'https://www.youtube.com/embed/jwfGSu_wvm4',
            'layout'        => 'https://www.youtube.com/embed/IrWVYJgA6bU',
            'standard'      => 'https://www.youtube.com/embed/6OXDSR1XUN8',
            'advance'       => 'https://www.youtube.com/embed/rNs7l3EtvqU',
            'html'          => 'https://www.youtube.com/embed/ghVUmGCtJU4',
            'dragndrop'     => 'https://www.youtube.com/embed/kS4e4DvSK44',
            'export'        => 'https://www.youtube.com/embed/Qd-KlDFGaNU',
            'default'       => 'https://www.youtube.com/embed/skkRW4ZOo18'
        );
    }

    /**
     * Main function responsible to show create_new_form|listforms|listformdata page
     * It also calls js file and extra stylesheets
     *
     * @param string $page page to view
     * @return string page output
     * @since Edwiser Form 1.0.0
     */
    public function view($page) {
        global $USER, $CFG, $PAGE;
        $out = "";
        can_create_or_view_form($USER->id);
        $PAGE->requires->data_for_js('videotypes', $this->get_video_types());
        $js = [new moodle_url('https://www.google.com/recaptcha/api.js')];
        $css = [new moodle_url($CFG->wwwroot .'/local/edwiserform/style/datatables.css')];
        switch ($page) {
            case 'newform':
                $sitekey = get_config('local_edwiserform', 'google_recaptcha_sitekey');
                if (trim($sitekey) == '') {
                    $sitekey = 'null';
                }
                $PAGE->requires->js_call_amd('local_edwiserform/new_form_main', 'init', array($sitekey, PRO_URL));
                $PAGE->requires->data_for_js('sitekey', $sitekey);
                $formid = optional_param('formid', null, PARAM_FLOAT);
                $out = $this->get_renderer()->render(new add_new_form($formid));
                if ($formid) {
                    $page = 'editform';
                }
                $out .= html_writer::start_tag('div', array('id' => 'root-page-loading', 'style' => '
                    position: fixed;
                    width: 100%;
                    top: 0;
                    left: 0;
                    height: 100%;
                '));
                $out .= html_writer::start_tag('div', array('style' => '
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                '));
                $out .= get_string("error-occured-while-loading", "local_edwiserform");
                $out .= html_writer::end_tag('div');
                $out .= html_writer::end_tag('div');
                $css = [new moodle_url($CFG->wwwroot .'/local/edwiserform/style/formedit.css')];
                break;
            case 'listforms':
                $PAGE->requires->js_call_amd('local_edwiserform/form_list', 'init');
                $out = $this->get_renderer()->render(new list_form());
                break;
            case 'viewdata':
                $formid = optional_param('formid', null, PARAM_FLOAT);
                $PAGE->requires->js_call_amd('local_edwiserform/form_data_list', 'init', array($formid));
                $out = $this->get_renderer()->render(new list_form_data($formid));
                break;
        }
        foreach ($js as $jsfile) {
            $PAGE->requires->js($jsfile);
        }
        foreach ($css as $cssfile) {
            $PAGE->requires->css($cssfile);
        }
        return $out;
    }
}
