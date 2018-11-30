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
    $record->definition = '{
      "id": "f1287abf-2d1c-4e12-a6f2-0cf7c4660b59",
      "settings": {
        "formSettings": {
          "form": {
            "class": {
              "title": "Css Class",
              "id": "class",
              "type": "text",
              "value": "efb-form"
            },
            "background-color": {
              "title": "Background color",
              "id": "background-color",
              "type": "color",
              "value": "#ffffff"
            },
            "width": {
              "title": "Width(%)",
              "id": "width",
              "type": "range",
              "value": "100",
              "attrs": {
                "min": "20",
                "max": "100"
              }
            },
            "padding": {
              "title": "Padding(px)",
              "id": "padding",
              "type": "range",
              "value": "40",
              "attrs": {
                "min": "0",
                "max": "100"
              }
            },
            "color": {
              "title": "Label color",
              "id": "color",
              "type": "color",
              "value": "#000000"
            },
            "display-label": {
              "title": "Field label position",
              "id": "display-label",
              "type": "select",
              "value": "top",
              "options": {
                "option1": {
                  "value": "off",
                  "label": "No label",
                  "selected": false
                },
                "option2": {
                  "value": "top",
                  "label": "Top",
                  "selected": true
                },
                "option3": {
                  "value": "left",
                  "label": "Left",
                  "selected": false
                }
              }
            },
            "style": {
              "title": "Custom Css Style",
              "id": "style",
              "type": "textarea",
              "value": ""
            }
          },
          "submit": {
            "class": {
              "title": "Css Class",
              "id": "class",
              "type": "text",
              "value": "btn btn-primary"
            },
            "text": {
              "title": "Label",
              "id": "text",
              "type": "text",
              "value": "Submit"
            },
            "processing-text": {
              "title": "Processing label",
              "id": "processing-text",
              "type": "text",
              "value": "Submitting...."
            },
            "position": {
              "title": "Position",
              "id": "position",
              "type": "select",
              "value": "center",
              "options": {
                "option1": {
                  "value": "left",
                  "label": "Left",
                  "selected": false
                },
                "option2": {
                  "value": "center",
                  "label": "Center",
                  "selected": true
                },
                "option3": {
                  "value": "right",
                  "label": "Right",
                  "selected": false
                }
              }
            },
            "style": {
              "title": "Custom Css Style",
              "id": "style",
              "type": "textarea",
              "value": ""
            }
          }
        }
      },
      "stages": {
        "9dfc7ab4-0464-49de-9cfd-9ef7d636b7fa": {
          "title": "Step 1",
          "id": "9dfc7ab4-0464-49de-9cfd-9ef7d636b7fa",
          "settings": {},
          "rows": [
            "f996f5c2-4802-4224-8849-7d74c115b8c3",
            "adee4b35-14ad-4c8b-a9ad-36b5356e6ebe"
          ]
        }
      },
      "rows": {
        "adee4b35-14ad-4c8b-a9ad-36b5356e6ebe": {
          "columns": [
            "3418dda9-c2a4-4045-8157-179b6e87e31d"
          ],
          "id": "adee4b35-14ad-4c8b-a9ad-36b5356e6ebe",
          "config": {
            "fieldset": false,
            "legend": "",
            "inputGroup": false
          },
          "attrs": {
            "className": "f-row"
          },
          "conditions": []
        },
        "f996f5c2-4802-4224-8849-7d74c115b8c3": {
          "columns": [
            "4d6c5196-1a57-453c-a72c-f8d4451610ac",
            "c8909d02-bafe-4cf7-b22d-db734d05f6fa"
          ],
          "id": "f996f5c2-4802-4224-8849-7d74c115b8c3",
          "config": {
            "fieldset": false,
            "legend": "",
            "inputGroup": false
          },
          "attrs": {
            "className": "f-row"
          },
          "conditions": []
        }
      },
      "columns": {
        "3418dda9-c2a4-4045-8157-179b6e87e31d": {
          "fields": [
            "1c882c37-6e03-4580-bb35-ae2ae4576ef9",
            "be63f2a5-14b3-4155-8ebf-8a25d09dee00",
            "d3351bff-ad65-4f5d-8492-c4cdc11f1992",
            "e9b549b2-f07b-473f-b9dd-870d65d2e7bc",
            "d1bffb2e-edd0-4905-9541-f1702cc8a3b0",
            "4cc221b9-d019-43b7-810c-4369c683d0c4"
          ],
          "id": "3418dda9-c2a4-4045-8157-179b6e87e31d",
          "config": {
            "width": "100%"
          },
          "className": [],
          "style": "width: 100%",
          "tag": "div",
          "content": [
            {
              "tag": "input",
              "attrs": {
                "type": "email",
                "required": false,
                "name": "email",
                "className": "form-control",
                "style": "",
                "placeholder": "Email"
              },
              "config": {
                "disabledAttrs": [
                  "type",
                  "template"
                ],
                "label": "Email"
              },
              "meta": {
                "group": "standard",
                "icon": "email",
                "id": "email"
              },
              "fMap": "attrs.value",
              "id": "1c882c37-6e03-4580-bb35-ae2ae4576ef9"
            },
            {
              "tag": "textarea",
              "config": {
                "label": "Was the course helpful?",
                "disabledAttrs": [
                  "template"
                ]
              },
              "meta": {
                "group": "standard",
                "icon": "textarea",
                "id": "textarea"
              },
              "attrs": {
                "required": false,
                "name": "course-comment",
                "className": "form-control",
                "style": "",
                "template": true,
                "placeholder": "Was the course helpful?"
              },
              "id": "be63f2a5-14b3-4155-8ebf-8a25d09dee00"
            },
            {
              "tag": "input",
              "attrs": {
                "type": "radio",
                "name": "course-content-rating",
                "required": false,
                "style": "",
                "template": true,
                "placeholder": "Rate the course content"
              },
              "config": {
                "label": "Rate the course content",
                "disabledAttrs": [
                  "type",
                  "template"
                ]
              },
              "meta": {
                "group": "standard",
                "icon": "radio-group",
                "id": "radio"
              },
              "options": [
                {
                  "label": "Very Good",
                  "value": "very-good",
                  "selected": false
                },
                {
                  "label": "Good",
                  "value": "good",
                  "selected": false
                },
                {
                  "label": "Average",
                  "value": "average",
                  "selected": false
                },
                {
                  "label": "Poor",
                  "value": "poor",
                  "selected": false
                },
                {
                  "label": "Very Poor",
                  "value": "very-poor",
                  "selected": false
                }
              ],
              "id": "d3351bff-ad65-4f5d-8492-c4cdc11f1992"
            },
            {
              "tag": "textarea",
              "config": {
                "label": "Any improvements that the course content can have?",
                "disabledAttrs": [
                  "template"
                ]
              },
              "meta": {
                "group": "standard",
                "icon": "textarea",
                "id": "textarea"
              },
              "attrs": {
                "required": false,
                "name": "improvement",
                "className": "form-control",
                "style": "",
                "template": true,
                "placeholder": "Any improvements that the course content can have?"
              },
              "id": "e9b549b2-f07b-473f-b9dd-870d65d2e7bc"
            },
            {
              "tag": "input",
              "attrs": {
                "type": "radio",
                "name": "teacher-rating",
                "required": false,
                "style": "",
                "template": true,
                "placeholder": "Rate the course content"
              },
              "config": {
                "label": "Rate Instructor’s teaching skills?",
                "disabledAttrs": [
                  "type",
                  "template"
                ]
              },
              "meta": {
                "group": "standard",
                "icon": "radio-group",
                "id": "radio"
              },
              "options": [
                {
                  "label": "Very Good",
                  "value": "very-good",
                  "selected": false
                },
                {
                  "label": "Good",
                  "value": "good",
                  "selected": false
                },
                {
                  "label": "Average",
                  "value": "average",
                  "selected": false
                },
                {
                  "label": "Poor",
                  "value": "poor",
                  "selected": false
                },
                {
                  "label": "Very Poor",
                  "value": "very-poor",
                  "selected": false
                }
              ],
              "id": "d1bffb2e-edd0-4905-9541-f1702cc8a3b0"
            },
            {
              "tag": "input",
              "attrs": {
                "type": "radio",
                "name": "experiance",
                "required": false,
                "style": "",
                "template": true,
                "placeholder": "Rate the course content"
              },
              "config": {
                "label": "Your experience of using this interface",
                "disabledAttrs": [
                  "type",
                  "template"
                ]
              },
              "meta": {
                "group": "standard",
                "icon": "radio-group",
                "id": "radio"
              },
              "options": [
                {
                  "label": "Very Good",
                  "value": "very-good",
                  "selected": false
                },
                {
                  "label": "Good",
                  "value": "good",
                  "selected": false
                },
                {
                  "label": "Average",
                  "value": "average",
                  "selected": false
                },
                {
                  "label": "Poor",
                  "value": "poor",
                  "selected": false
                },
                {
                  "label": "Very Poor",
                  "value": "very-poor",
                  "selected": false
                }
              ],
              "id": "4cc221b9-d019-43b7-810c-4369c683d0c4"
            }
          ],
          "attrs": {
            "className": [
              "f-render-column"
            ]
          }
        },
        "4d6c5196-1a57-453c-a72c-f8d4451610ac": {
          "fields": [
            "683c0c62-ac4e-4562-8a99-fdcfe4115960"
          ],
          "id": "4d6c5196-1a57-453c-a72c-f8d4451610ac",
          "config": {
            "width": "50%"
          },
          "className": [],
          "style": "width: 50%",
          "tag": "div",
          "content": [
            {
              "tag": "input",
              "attrs": {
                "type": "text",
                "required": false,
                "name": "firstname",
                "className": "form-control",
                "style": "",
                "placeholder": "Firstname"
              },
              "config": {
                "disabledAttrs": [
                  "type",
                  "template"
                ],
                "label": "Firstname"
              },
              "meta": {
                "group": "standard",
                "icon": "text-input",
                "id": "text-input"
              },
              "fMap": "attrs.value",
              "id": "683c0c62-ac4e-4562-8a99-fdcfe4115960"
            }
          ],
          "attrs": {
            "className": [
              "f-render-column"
            ]
          }
        },
        "c8909d02-bafe-4cf7-b22d-db734d05f6fa": {
          "fields": [
            "aca414e3-32f5-4493-835e-f1459d3df1b2"
          ],
          "id": "c8909d02-bafe-4cf7-b22d-db734d05f6fa",
          "config": {
            "width": "50%"
          },
          "className": [],
          "style": "width: 50%",
          "tag": "div",
          "content": [
            {
              "tag": "input",
              "attrs": {
                "type": "text",
                "required": false,
                "name": "lastname",
                "className": "form-control",
                "style": "",
                "placeholder": "Lastname"
              },
              "config": {
                "disabledAttrs": [
                  "type",
                  "template"
                ],
                "label": "Lastname"
              },
              "meta": {
                "group": "standard",
                "icon": "text-input",
                "id": "text-input"
              },
              "fMap": "attrs.value",
              "id": "aca414e3-32f5-4493-835e-f1459d3df1b2"
            }
          ],
          "attrs": {
            "className": [
              "f-render-column"
            ]
          }
        }
      },
      "fields": {
        "d3351bff-ad65-4f5d-8492-c4cdc11f1992": {
          "tag": "input",
          "attrs": {
            "type": "radio",
            "name": "course-content-rating",
            "required": false,
            "style": "",
            "placeholder": "Rate the course content"
          },
          "config": {
            "label": "Rate the course content",
            "disabledAttrs": [
              "type",
              "template"
            ]
          },
          "meta": {
            "group": "standard",
            "icon": "radio-group",
            "id": "radio"
          },
          "options": [
            {
              "label": "Very Good",
              "value": "very-good",
              "selected": false
            },
            {
              "label": "Good",
              "value": "good",
              "selected": false
            },
            {
              "label": "Average",
              "value": "average",
              "selected": false
            },
            {
              "label": "Poor",
              "value": "poor",
              "selected": false
            },
            {
              "label": "Very Poor",
              "value": "very-poor",
              "selected": false
            }
          ],
          "id": "d3351bff-ad65-4f5d-8492-c4cdc11f1992"
        },
        "be63f2a5-14b3-4155-8ebf-8a25d09dee00": {
          "tag": "textarea",
          "config": {
            "label": "Was the course helpful?",
            "disabledAttrs": [
              "template"
            ]
          },
          "meta": {
            "group": "standard",
            "icon": "textarea",
            "id": "textarea"
          },
          "attrs": {
            "required": false,
            "name": "course-comment",
            "className": "form-control",
            "style": "",
            "placeholder": "Was the course helpful?"
          },
          "id": "be63f2a5-14b3-4155-8ebf-8a25d09dee00"
        },
        "e9b549b2-f07b-473f-b9dd-870d65d2e7bc": {
          "tag": "textarea",
          "config": {
            "label": "Any improvements that the course content can have?",
            "disabledAttrs": [
              "template"
            ]
          },
          "meta": {
            "group": "standard",
            "icon": "textarea",
            "id": "textarea"
          },
          "attrs": {
            "required": false,
            "name": "improvement",
            "className": "form-control",
            "style": "",
            "placeholder": "Any improvements that the course content can have?"
          },
          "id": "e9b549b2-f07b-473f-b9dd-870d65d2e7bc"
        },
        "d1bffb2e-edd0-4905-9541-f1702cc8a3b0": {
          "tag": "input",
          "attrs": {
            "type": "radio",
            "name": "teacher-rating",
            "required": false,
            "style": "",
            "placeholder": "Rate the course content"
          },
          "config": {
            "label": "Rate Instructor’s teaching skills?",
            "disabledAttrs": [
              "type",
              "template"
            ]
          },
          "meta": {
            "group": "standard",
            "icon": "radio-group",
            "id": "radio"
          },
          "options": [
            {
              "label": "Very Good",
              "value": "very-good",
              "selected": false
            },
            {
              "label": "Good",
              "value": "good",
              "selected": false
            },
            {
              "label": "Average",
              "value": "average",
              "selected": false
            },
            {
              "label": "Poor",
              "value": "poor",
              "selected": false
            },
            {
              "label": "Very Poor",
              "value": "very-poor",
              "selected": false
            }
          ],
          "id": "d1bffb2e-edd0-4905-9541-f1702cc8a3b0"
        },
        "4cc221b9-d019-43b7-810c-4369c683d0c4": {
          "tag": "input",
          "attrs": {
            "type": "radio",
            "name": "experiance",
            "required": false,
            "style": "",
            "placeholder": "Rate the course content"
          },
          "config": {
            "label": "Your experience of using this interface",
            "disabledAttrs": [
              "type",
              "template"
            ]
          },
          "meta": {
            "group": "standard",
            "icon": "radio-group",
            "id": "radio"
          },
          "options": [
            {
              "label": "Very Good",
              "value": "very-good",
              "selected": false
            },
            {
              "label": "Good",
              "value": "good",
              "selected": false
            },
            {
              "label": "Average",
              "value": "average",
              "selected": false
            },
            {
              "label": "Poor",
              "value": "poor",
              "selected": false
            },
            {
              "label": "Very Poor",
              "value": "very-poor",
              "selected": false
            }
          ],
          "id": "4cc221b9-d019-43b7-810c-4369c683d0c4"
        },
        "683c0c62-ac4e-4562-8a99-fdcfe4115960": {
          "tag": "input",
          "attrs": {
            "type": "text",
            "required": true,
            "template": true,
            "name": "firstname",
            "className": "form-control",
            "style": "",
            "placeholder": "Firstname"
          },
          "config": {
            "disabledAttrs": [
              "type",
              "template"
            ],
            "label": "Firstname"
          },
          "meta": {
            "group": "standard",
            "icon": "text-input",
            "id": "text-input"
          },
          "fMap": "attrs.value",
          "id": "683c0c62-ac4e-4562-8a99-fdcfe4115960"
        },
        "aca414e3-32f5-4493-835e-f1459d3df1b2": {
          "tag": "input",
          "attrs": {
            "type": "text",
            "required": true,
            "template": true,
            "name": "lastname",
            "className": "form-control",
            "style": "",
            "placeholder": "Lastname"
          },
          "config": {
            "disabledAttrs": [
              "type",
              "template"
            ],
            "label": "Lastname"
          },
          "meta": {
            "group": "standard",
            "icon": "text-input",
            "id": "text-input"
          },
          "fMap": "attrs.value",
          "id": "aca414e3-32f5-4493-835e-f1459d3df1b2"
        },
        "1c882c37-6e03-4580-bb35-ae2ae4576ef9": {
          "tag": "input",
          "attrs": {
            "type": "email",
            "template": true,
            "required": true,
            "name": "email",
            "className": "form-control",
            "style": "",
            "placeholder": "Email"
          },
          "config": {
            "disabledAttrs": [
              "type",
              "template"
            ],
            "label": "Email"
          },
          "meta": {
            "group": "standard",
            "icon": "email",
            "id": "email"
          },
          "fMap": "attrs.value",
          "id": "1c882c37-6e03-4580-bb35-ae2ae4576ef9"
        }
      }
    }';
    if ($new) {
        $DB->insert_record('efb_form_templates', $record, false);
        return;
    }
    $DB->update_record('efb_form_templates', $record, false);
    return;
}
