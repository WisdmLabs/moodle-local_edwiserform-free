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
 * Plugin version and other meta-data are defined here.
 *
 * @package     edwiserformevents_feedback
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 */

function xmldb_edwiserformevents_feedback_install() {
    global $DB;
    $record = $DB->get_record('efb_form_templates', array('name' => 'feedback'));
    $new  = false;
    if (!$record) {
    	$new = true;
    	$record = new stdClass;
    	$record->name = 'feedback';
    }
    $record->definition = '{"id":"a007ed4a-767f-4e4e-91c2-9590d21c4355","settings":{"formSettings":{"form":{"class":{"title":"Css Class","id":"class","type":"text","value":"efb-form"},"background-color":{"title":"Background color","id":"background-color","type":"color","value":"#ffffff"},"width":{"title":"Width(%)","id":"width","type":"range","value":"100","attrs":{"min":"20","max":"100"}},"padding":{"title":"Padding(px)","id":"padding","type":"range","value":"40","attrs":{"min":"0","max":"100"}},"color":{"title":"Label color","id":"color","type":"color","value":"#000000"},"display-label":{"title":"Field label position","id":"display-label","type":"select","value":"top","options":{"option1":{"value":"off","label":"No label","selected":false},"option2":{"value":"top","label":"Top","selected":true},"option3":{"value":"left","label":"Left","selected":false}}},"style":{"title":"Custom Css Style","id":"style","type":"textarea","value":""}},"submit":{"class":{"title":"Css Class","id":"class","type":"text","value":"btn btn-primary"},"text":{"title":"Label","id":"text","type":"text","value":"Submit"},"processing-text":{"title":"Processing label","id":"processing-text","type":"text","value":"Submitting...."},"position":{"title":"Position","id":"position","type":"select","value":"center","options":{"option1":{"value":"left","label":"Left","selected":false},"option2":{"value":"center","label":"Center","selected":true},"option3":{"value":"right","label":"Right","selected":false}}},"style":{"title":"Custom Css Style","id":"style","type":"textarea","value":""}}}},"stages":{"1e5118d8-d441-464c-aa19-4db06ff8d109":{"title":"Step 1","id":"1e5118d8-d441-464c-aa19-4db06ff8d109","settings":[],"rows":["b5c5f2a8-5ec2-48a4-ae34-073dace2ab7d"]}},"rows":{"b5c5f2a8-5ec2-48a4-ae34-073dace2ab7d":{"columns":["e5b25883-999b-41c6-8060-ce94634f6377"],"id":"b5c5f2a8-5ec2-48a4-ae34-073dace2ab7d","config":{"fieldset":false,"legend":"","inputGroup":false},"attrs":{"className":"f-row"},"conditions":[]}},"columns":{"e5b25883-999b-41c6-8060-ce94634f6377":{"fields":["9a221ee5-6a93-4144-92d8-b07685f0322b"],"id":"e5b25883-999b-41c6-8060-ce94634f6377","config":{"width":"100%"},"style":"width: 100%","tag":"div","content":[{"tag":"select","config":{"label":"Sample Question","disabledAttrs":["template","name"]},"attrs":{"required":false,"className":"form-control","style":"","placeholder":"Sample Question"},"meta":{"group":"standard","icon":"select","id":"select"},"options":[{"label":"option label-1","value":"option-1","selected":false},{"label":"option label-2","value":"option-2","selected":false},{"label":"option label-3","value":"option-3","selected":false},{"label":"option label-4","value":"option-4","selected":false}],"id":"9a221ee5-6a93-4144-92d8-b07685f0322b"}],"attrs":{"className":["f-render-column"]}}},"fields":{"9a221ee5-6a93-4144-92d8-b07685f0322b":{"tag":"select","config":{"label":"Sample Question","disabledAttrs":["template","name"]},"attrs":{"required":true,"className":"form-control","style":"","placeholder":"Sample Question","template":true},"meta":{"group":"standard","icon":"select","id":"select"},"options":[{"label":"option label-1","value":"option-1","selected":false},{"label":"option label-2","value":"option-2","selected":false},{"label":"option label-3","value":"option-3","selected":false},{"label":"option label-4","value":"option-4","selected":false}],"id":"9a221ee5-6a93-4144-92d8-b07685f0322b"}}}';
    if ($new) {
    	$DB->insert_record('efb_form_templates', $record, false);
    	return;
    }
	$DB->update_record('efb_form_templates', $record, false);
	return;
}
