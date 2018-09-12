<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of efb_add_new_form
 *
 * @author sudam
 */
defined('MOODLE_INTERNAL') || die();
include_once ($CFG->dirroot . '/local/edwiserform/classes/efb_form_basic_settings.php');
include_once ($CFG->dirroot . '/local/edwiserform/classes/efb_new_form_sections.php');

class efb_add_new_form implements renderable, templatable
{

    /**
     *
     * @var Integer Form id, this will be the form id to edit or it can be the null in case of the new form creation.
     */
    private $formid         = null;
    private $form_sections = null;

    // Plugins installed in events directory
    private $plugin = [];

    public function __construct($formid = null)
    {
        $this->formid        = $formid;
        $this->plugins        = get_plugins();
        $this->form_sections = new efb_new_form_sections();
        $this->form = null;
        if ($formid != null) {
            global $DB;
            $this->form = $DB->get_record("efb_forms", array("id" => $this->formid));
        }
        $this->set_default_section_data();
    }

    /**
     * Method provide the functionality to get the forms previous settings.
     */
    private function get_form_settings()
    {
        $data = array();
        if ($this->form) {
            $data = array(
                "id"             => $this->form->id,
                "title"          => $this->form->title,
                "editdata"       => $this->form->data_edit,
                "description"    => $this->form->description,
                "type"           => $this->form->type,
                "notifi_email"   => $this->form->notifi_email
            );
        }
        return $data;
    }

    /**
     * Method provides the functionality to render the basic form template.
     */
    public function export_for_template(\renderer_base $output)
    {
        global $PAGE;
        $this->form_sections->setForm_action(get_string("efb-form-editing", "local_edwiserform"));
        if ($this->form) {
            $PAGE->requires->data_for_js('formdefinition', $this->form->definition);
            $this->form_sections->setForm_title($this->form->title);
            $this->form_sections->setFormid($this->formid);
        }
        $logo = $output->get_logo_url();
        if (!$logo) {
            $logo = $output->image_url("edwiser-logoalternate", "local_edwiserform");
        }
        $this->form_sections->setLogo($logo);
        return $this->form_sections->get_form_section_data();
    }

    private function set_default_section_data()
    {
        $settingsparam = array('plugins' => $this->plugins);
        $settingsparam['form'] = $this->form ? $this->form : null;
        $form_settings = new efb_form_basic_settings(null, $settingsparam);
        $form_data     = $this->get_form_settings();
        $form_settings->set_data($form_data);
        $header_button = array(
            array(
                "id"    => "efb-heading-listforms",
                "label" => get_string("efb-heading-listforms", "local_edwiserform"),
                "url"   => new moodle_url('/local/edwiserform/view.php?page=listforms'),
                "icon"  => "list"
            ),
            array(
                "id"    => "efb-btn-save-form-settings",
                "label" => get_string("efb-btn-save", "local_edwiserform"),
                "url"   => "#",
                "class" => "d-none",
                "icon"  => "check"
            )
        );
        $nav_item      = array(
            array(
                "id"      => "efb-form-setup",
                "active"  => $this->form ? "" : "active",
                "panelid" => "#efb-cont-form-setup",
                "label"   => get_string("efb-lbl-form-setup", "local_edwiserform"),
                "icon"    => "fa-cog"
            ),
            array(
                "id"      => "efb-form-settings",
                "panelid" => "#efb-cont-form-settings",
                "label"   => get_string("efb-lbl-form-settings", "local_edwiserform"),
                "icon"    => "fa-wrench"
            ),
            array(
                "id"      => "efb-form-builder",
                "active"  => $this->form ? "active" : "",
                "panelid" => "#efb-cont-form-builder",
                "label"   => get_string("efb-lbl-form-builder", "local_edwiserform"),
                "icon"    => "fa-list-alt"
            ),
            array(
                "id"      => "efb-form-preview",
                "panelid" => "#efb-cont-form-preview",
                "label"   => get_string("efb-lbl-form-preview", "local_edwiserform"),
                "icon"    => "fa-eye"
            )
        );
        $panels        = array(
            array(
                "id"      => "efb-cont-form-settings",
                "heading" => get_string("efb-lbl-form-settings", "local_edwiserform"),
                "body"    => "<div class='efb-form-settings'>".$form_settings->render()."</div>"
            ),
            array(
                "id"      => "efb-cont-form-builder",
                "active"  => $this->form ? "active" : "hide",
                "heading" => get_string("efb-lbl-form-builder", "local_edwiserform"),
                "body"    => "<form class='build-form'></form>",
                "button"  => "<button class='efb-form-step efb-form-step-preview bg-primary fa fa-eye' data-id='efb-form-preview'></button>"
            ),
            array(
                "id"      => "efb-cont-form-preview",
                "heading" => get_string("efb-lbl-form-preview", "local_edwiserform"),
                "body"    => "<form class='render-form'></form>"
            ),
        );
        $this->form_sections->set_builder_active($this->form ? "content-hide" : "content-active");
        $this->form_sections->setNav_item($nav_item);
        $this->form_sections->setPanels($panels);
        $this->form_sections->setHeader_button($header_button);
        $this->form_sections->setPanel_setup($this->setupData());
    }

    private function setupData()
    {
        foreach (array_keys($this->plugins) as $pluginname) {
            $free[] = array(
                "tmpl_id"        => $pluginname,
                "tmpl_name"      => get_string("efb-event-$pluginname-name", "edwiserformevents_$pluginname"),
                "tmpl_hover_txt" => get_string("efb-event-hover-text", "local_edwiserform"),
                "desc"           => get_string("efb-event-$pluginname-desc", "edwiserformevents_$pluginname"),
            );
        }
        $protemplates = array('blank', 'login', 'enrolment', 'registration');
        foreach ($protemplates as $templatename) {
            $pro[] = array(
                "tmpl_id"        => $templatename,
                "pro"            => true,
                "tmpl_name"      => get_string("efb-event-$templatename-name", "local_edwiserform"),
                "desc"           => get_string("efb-event-$templatename-desc", "local_edwiserform"),
            );
        }
        if ($this->form) {
            $setup["form_name"]["value"] = $this->form->title;
            foreach ($free as $key => $value) {
                $free[$key]["active"] = $value["tmpl_id"] == $this->form->type;
            }
        }
        $heading = $this->form ? 'builder' : 'setup';
        $title = $this->form ? $this->form->title : '';
        $setup = array(
            "id"              => "efb-cont-form-setup",
            "heading"         => get_string("efb-lbl-form-$heading", "local_edwiserform"),
            "title"           => $title,
            "active"          => "active",
            "msg_select_tmpl" => get_string("efb-setup-msg-select-tmpl", "local_edwiserform"),
            "form_name"       => array(
                "label"       => get_string("efb-lbl-form-setup-formname", "local_edwiserform"),
                "placeholder" => get_string("efb-lbl-form-setup-formname-placeholder", "local_edwiserform")
            ),
            "free"            => $free,
            "pro"             => $pro,
            "tmpl_add_title"  => get_string("efb-setup-additional-title", "local_edwiserform"),
            "msg_upgrade"     => get_string("efb-setup-msg-upgrade", "local_edwiserform"),
            "btn_upgrade"     => get_string("efb-setup-btn-upgrade", "local_edwiserform"),
        );
        return (object) $setup;
    }
}
