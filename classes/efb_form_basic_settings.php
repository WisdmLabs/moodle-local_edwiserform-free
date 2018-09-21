<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of efb_form_basic_settings
 *
 * @author sudam
 */
class efb_form_basic_settings extends moodleform
{
    public function __construct($action = null, $customdata = null, $method = 'post', $target = '', $attributes = null, $editable = true, $ajaxformdata = null)
    {
        parent::__construct($action, $customdata, $method, $target, array("id"=>"efb-basic-form-settings"), $editable, $ajaxformdata);
    }
    protected function definition()
    {
        global $PAGE, $CFG;
        $form           = $this->_form;
        $events = array(
            "blank"      => get_string("efb-event-blank-name", "local_edwiserform"),
        );
        $plugins = $this->_customdata['plugins'];
        foreach (array_keys($plugins) as $plugin) {
            $events[$plugin] = get_string("efb-event-$plugin-name", "edwiserformevents_$plugin");
        }
        $form->addElement("hidden", "id",null);
        $form->setType("id", PARAM_INTEGER);
        $form->addElement("text", "title", get_string("efb-lbl-title", "local_edwiserform"), null);
        $form->addRule('title', get_string("efb-lbl-title-warning", "local_edwiserform"), "required", null, "client");
        $form->setType("title", PARAM_TEXT);
        $form->addElement("textarea", "description", get_string("efb-lbl-description", "local_edwiserform"), null);
        $form->setType("description", PARAM_TEXT);
        $form->addElement("select", "type", get_string("efb-lbl-event", "local_edwiserform"), $events);
        $form->addElement("text", "notifi_email", get_string("efb-lbl-notifi-email", "local_edwiserform"), null);
        $form->setType("notifi_email", PARAM_TEXT);
        $form->addElement('checkbox', 'editdata', get_string('efb-lbl-allowedit', 'local_edwiserform'), get_string('efb-lbl-allowedit-desc', 'local_edwiserform'));
        $context = context_system::instance();
        $form->addElement("editor", "confirmation_msg", get_string("efb-lbl-confirmation-msg", "local_edwiserform"), null, array(
            'maxfiles' => EDITOR_UNLIMITED_FILES,
            'noclean' => true,
            'context' => $context,
            'subdirs' => false
        ));
        $form->setType("confirmation_msg", PARAM_RAW);
        $buildform = html_writer::start_tag("div", array("class" => "text-center"));
        $buildform .= html_writer::tag("button", get_string("efb-form-builder-step", "local_edwiserform"), array('class' => 'efb-form-step btn btn-primary', 'data-id' => 'efb-form-builder'));
        $buildform .= html_writer::end_tag("div");
        $form->addElement("html", $buildform);
        foreach ($plugins as $plugin) {
            $plugin->get_settings($form, $this->_customdata['form']);
        }
        $PAGE->requires->js(new moodle_url($CFG->wwwroot."/local/edwiserform/amd/src/".get_class().".js"));

    }
}
