<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of efb_new_form_sections
 *
 * @author sudam
 */
class efb_new_form_sections
{

    private $nav_item;
    private $panels;
    private $logo;
    private $form_title;
    private $list_page_url;
    private $formid;
    private $form_action;
    private $header_button;
    private $section_data;
    private $panel_setup;
    private $builder_active;

    public function get_form_section_data()
    {
        $this->section_data = new stdClass();
        $this->section_data->nav_item= $this->getNav_item();
        $this->section_data->panels= $this->getPanels();
        $this->section_data->logo= $this->getLogo();
        $this->section_data->form_title= $this->getForm_title();
        $this->section_data->list_page_url= $this->getList_page_url();
        $this->section_data->formid= $this->getFormid();
        $this->section_data->form_action= $this->getForm_action();
        $this->section_data->header_button= $this->getHeader_button();
        $this->section_data->panel_setup= $this->getPanel_setup();
        $this->section_data->builder_active = $this->get_builder_active();
        return $this->section_data;
    }

    function getPanel_setup()
    {
        return $this->panel_setup;
    }

    function setPanel_setup($panel_setup)
    {
        $this->panel_setup = $panel_setup;
    }

        public function getNav_item()
    {
        return $this->nav_item;
    }

    public function getPanels()
    {
        return $this->panels;
    }

    public function getLogo()
    {
        return $this->logo;
    }

    public function getForm_title()
    {
        return $this->form_title;
    }

    public function getList_page_url()
    {
        return $this->list_page_url;
    }

    public function getFormid()
    {
        return $this->formid;
    }

    public function getForm_action()
    {
        return $this->form_action;
    }

    public function getHeader_button()
    {
        return $this->header_button;
    }

    public function get_builder_active() {
        return $this->builder_active;
    }

    public function setNav_item($nav_item)
    {
        $this->nav_item = $nav_item;
    }

    public function setPanels($panels)
    {
        $this->panels = $panels;
    }

    public function setLogo($logo)
    {
        $this->logo = $logo;
    }

    public function setForm_title($form_title)
    {
        $this->form_title = $form_title;
    }

    public function setList_page_url($list_page_url)
    {
        $this->list_page_url = $list_page_url;
    }

    public function setFormid($formid)
    {
        $this->formid = $formid;
    }

    public function setForm_action($form_action)
    {
        $this->form_action = $form_action;
    }

    public function setHeader_button($header_button)
    {
        $this->header_button = $header_button;
    }

    public function set_builder_active($builder_active) {
        $this->builder_active = $builder_active;
    }

}
