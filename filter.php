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
 * This filter provides automatic linking to
 * Form builder entries, aliases and categories when
 * found inside every Moodle text.
 *
 * @package     filter_edwiserformlink
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 */

defined('MOODLE_INTERNAL') || die();

class filter_edwiserformlink extends moodle_text_filter {
    private function filter_tags($tags) {
        $forms = [];
        for ($i = 0; $i < count($tags[0]); $i++) {
            $form = new stdClass;
            $form->tag = $tags[0][$i];
            $form->id = $tags[1][$i];
            if ($tags[2][$i] != '') {
                $form->version = $tags[3][$i];
            }
            $forms[] = $form;
        }
        return $forms;
    }
    public function filter($text, array $options = array()) {
        preg_match_all(
            "(\[edwiser\-form[ ]+id\=[\'\"’‘“”]([0-9]+)[\'\"’‘“”]([ ]+version\=[\'\"’‘“”]([0-9]*)[\'\"’‘“”])?\])",
            $text,
            $tags
        );
        if ($tags[0]) {
            global $PAGE, $CFG;
            $sitekey = get_config('local_edwiserform', 'google_recaptcha_sitekey');
            if (trim($sitekey) == '') {
                $sitekey = 'null';
            }
            $stringmanager = get_string_manager();
            $strings = $stringmanager->load_component_strings('local_edwiserform', 'en');
            $PAGE->requires->strings_for_js(array_keys($strings), 'local_edwiserform');
            $PAGE->requires->js(new moodle_url('https://www.google.com/recaptcha/api.js'));
            $PAGE->requires->js_call_amd('local_edwiserform/render_form', 'init', array($sitekey));
            $tags = $this->filter_tags($tags);
            foreach ($tags as $form) {
                $container = "<div class='edwiserform-root-container'><form class='edwiserform-container' action='' method='post'>
                                <input type='hidden' class='id' value='" . $form->id . "'>";
                if (property_exists($form, 'version')) {
                    $container .= "<input type='hidden' class='version' value='" . $form->version . "'>";
                }
                $container .= "</form></div>";
                $text = str_replace($form->tag, $container, $text);
            }
        }
        return $text;
    }
}
