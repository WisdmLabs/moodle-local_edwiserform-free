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

class efb_new_form_sections {

    private $navitem;
    private $panels;
    private $logo;
    private $formtitle;
    private $listpageurl;
    private $formid;
    private $formaction;
    private $headerbutton;
    private $sectiondata;
    private $panelsetup;
    private $builderactive;

    public function get_form_section_data() {
        $this->section_data = new stdClass();
        $this->section_data->nav_item = $this->get_nav_item();
        $this->section_data->panels = $this->get_panels();
        $this->section_data->logo = $this->get_logo();
        $this->section_data->formtitle = $this->get_form_title();
        $this->section_data->listpageurl = $this->get_list_page_url();
        $this->section_data->formid = $this->get_formid();
        $this->section_data->formaction = $this->get_form_action();
        $this->section_data->headerbutton = $this->get_header_button();
        $this->section_data->panelsetup = $this->get_panel_setup();
        $this->section_data->builderactive = $this->get_builder_active();
        return $this->section_data;
    }

    public function get_panel_setup() {
        return $this->panelsetup;
    }

    public function set_panel_setup($panelsetup) {
        $this->panelsetup = $panelsetup;
    }

    public function get_nav_item() {
        return $this->nav_item;
    }

    public function get_panels() {
        return $this->panels;
    }

    public function get_logo() {
        return $this->logo;
    }

    public function get_form_title() {
        return $this->formtitle;
    }

    public function get_list_page_url() {
        return $this->listpageurl;
    }

    public function get_formid() {
        return $this->formid;
    }

    public function get_form_action() {
        return $this->formaction;
    }

    public function get_header_button() {
        return $this->headerbutton;
    }

    public function get_builder_active() {
        return $this->builderactive;
    }

    public function set_nav_item($navitem) {
        $this->nav_item = $navitem;
    }

    public function set_panels($panels) {
        $this->panels = $panels;
    }

    public function set_logo($logo) {
        $this->logo = $logo;
    }

    public function set_form_title($formtitle) {
        $this->formtitle = $formtitle;
    }

    public function set_list_page_url($listpageurl) {
        $this->listpageurl = $listpageurl;
    }

    public function set_formid($formid) {
        $this->formid = $formid;
    }

    public function set_form_action($formaction) {
        $this->formaction = $formaction;
    }

    public function set_header_button($headerbutton) {
        $this->headerbutton = $headerbutton;
    }

    public function set_builder_active($builderactive) {
        $this->builderactive = $builderactive;
    }

}
