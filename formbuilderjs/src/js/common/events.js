import dom from './dom';
import {getString} from './utils';
const M = window.M;
// Default options
const defaults = {
  formeoLoaded: evt => {},
  onAdd: () => {},
  onUpdate: evt => {
  },
  onSave: evt => {},
  confirmReset: evt => {
    dom.multiActions(
        'warning',
        getString('attention'),
        evt.confirmationMessage,
        [{
          title: M.util.get_string('proceed', 'local_edwiserform'),
          type: 'primary',
          action: function() {
            evt.resetAction(evt);
          }
        }, {
          title: M.util.get_string('cancel', 'local_edwiserform'),
          type: 'default'
        }]
    );
  },
  confirmClearStorage: evt => {
    dom.multiActions(
        'danger',
        getString('danger'),
        evt.confirmationMessage,
        [{
          title: getString('clearstorageautomatic'),
          type: 'primary',
          action: function() {
            evt.clearStorageAction(evt);
          }
        }, {
          title: getString('clearstoragemanually'),
          type: 'default',
          action: function() {
            evt.clearStorageManualAction(evt);
          }
        }]
    );
  }
};

/**
 * Events class is used to register events and throttle their callbacks
 */
const events = {
  init: function(options) {
    this.opts = Object.assign({}, defaults, options);
    return this;
  },
  formeoSaved: new CustomEvent('formeoSaved', {}),
  formeoUpdated: new CustomEvent('formeoUpdated', {})
};

document.addEventListener('formeoUpdated', function(evt) {
  const {timeStamp, type, data} = evt;
  const evtData = {
    timeStamp,
    type,
    data
  };
  events.opts.onUpdate(evtData);
});

document.addEventListener('confirmReset', function(evt) {
  const evtData = {
    timeStamp: evt.timeStamp,
    type: evt.type,
    rowCount: evt.detail.rows.length,
    confirmationMessage: evt.detail.confirmationMessage,
    resetAction: evt.detail.resetAction,
    btnCoords: evt.detail.btnCoords
  };

  events.opts.confirmReset(evtData);
});

document.addEventListener('formeoSaved', evt => {
  evt = {
    timeStamp: evt.timeStamp,
    type: evt.type,
    formData: evt.detail.formData
  };
  events.opts.onSave(evt);
});

document.addEventListener('confirmClearStorage', function(evt) {
  const evtData = {
    timeStamp: evt.timeStamp,
    type: evt.type,
    confirmationMessage: evt.detail.confirmationMessage,
    clearStorageAction: evt.detail.clearStorageAction,
    clearStorageManualAction: evt.detail.clearStorageManualAction,
  };

  events.opts.confirmClearStorage(evtData);
});

document.addEventListener('formeoLoaded', function(evt) {
  events.opts.formeoLoaded(evt.detail.formeo);
  // Window.controlNav = evt.detail.formeo.controls.controlNav;
});

export default events;
