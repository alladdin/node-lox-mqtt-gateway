const util = require('util');
const events = require('events');
const unidecode = require('unidecode');

var Adaptor = function (structure, mqtt_prefix) {
    this.structure = structure;
    this.mqtt_prefix = mqtt_prefix;
    if (this.mqtt_prefix === undefined) {
        this.mqtt_prefix = 'lox';
    }

    this.room2name = {};
    this.cat2name = {};
    this.path2control = {};
    this.controlid2path = {};
    this.stateuuid2path = {};
    this._build_rooms();
    this._build_cats();
    this._build_paths();

    this._register_events();
};

util.inherits(Adaptor, events.EventEmitter);

Adaptor.prototype.set_value_for_uuid = function(uuid, value) {
    this.structure.set_value_for_uuid(uuid, value);
};

Adaptor.prototype.get_command_from_topic = function(topic, data) {
    var path_groups = topic.match('^(.+)/cmd$');
    if (!path_groups){
        return {};
    }
    var control = this.path2control[path_groups[1]];
    if (!control){
        return {};
    }
    return {
        'uuidAction': control.uuidAction,
        'command': data
    };
};

Adaptor.prototype.get_topic_for_subscription = function() {
    return this.mqtt_prefix + '/+/+/+/cmd'
};

Adaptor.prototype.abort = function() {
    /*this.structure.removeAllListeners();*/
    this.structure = undefined;
    /*this.removeAllListeners();*/
};

Adaptor.prototype._build_rooms = function() {
    Object.keys(this.structure.rooms.items).forEach(function(key){
        var room = this.structure.rooms.items[key];
        var name = this._normalize_name(room.name);
        this.room2name[room.uuid] = name;
    }, this);
};

Adaptor.prototype._build_cats = function() {
    Object.keys(this.structure.categories.items).forEach(function(key){
        var cat = this.structure.categories.items[key];
        var name = this._normalize_name(cat.name);
        this.cat2name[cat.uuid] = name;
    }, this);
};

Adaptor.prototype._build_paths = function() {
    Object.keys(this.structure.controls.items).forEach(function(key){
        var control = this.structure.controls.items[key];
        this._add_control(control);
        if (control.subControls !== undefined){
            Object.keys(control.subControls.items).forEach(function(sub_key){
                this._add_control(control.subControls.items[sub_key], control.room, control.category);
            }, this);
        }
    }, this);

    this.controlid2path[this.structure.globalStates.id] = 'miniserver/global';
    this.path2control['miniserver/global'] = this.structure.globalStates;
    Object.keys(this.structure.globalStates).forEach(function(key){
        this.stateuuid2path[this.structure.globalStates[key].uuid] = 'miniserver/global/raw_state/' + key;
    }, this);
};

Adaptor.prototype._register_events = function() {
    var that = this;
    Object.keys(this.path2control).forEach(function(path){
        this.path2control[path].on('state_update', function(control){
            if (that.controlid2path[control.id] !== undefined){
                that.emit('for_mqtt', that.controlid2path[control.id]+'/state', JSON.stringify(control.get_state()) );
            }else{
                throw new Error('Invalid control! - path');
            }
        });
    }, this);
};

Adaptor.prototype._add_control = function(control, default_room, default_category){
    var name = this._normalize_name(control.name);
    var room = this.room2name[control.room];
    if (room === undefined){
        room = this.room2name[default_room];
    }
    var category = this.cat2name[control.category];
    if (category === undefined){
        category = this.cat2name[default_category];
    }
    var path = this.mqtt_prefix+'/'+room+'/'+category+'/'+name;
    this.path2control[path] = control;
    this.controlid2path[control.id] = path;
    if (control.states !== undefined){
        Object.keys(control.states.items).forEach(function(state_key){
            this.stateuuid2path[control.states.items[state_key].uuid] = path + '/raw_state/' + state_key;
        }, this);
    }
}

Adaptor.prototype._normalize_name = function(name){
    return unidecode(''+name).replace(/\s+/g,'_').toLowerCase();
}

module.exports = Adaptor;
