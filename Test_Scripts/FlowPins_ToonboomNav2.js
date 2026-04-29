function FlowPinsTool() {
    var d = new QDialog();
    var layout = new QVBoxLayout();

// Start Execution


// Get all top-level GROUP nodes directly under Top
var group_list  = [];
var group_count = 0;
var _children_n_954375 = node.subNodes("Top");
for (var _i_n_954375 = 0; _i_n_954375 < _children_n_954375.length; _i_n_954375++) {
  var _child_n_954375 = _children_n_954375[_i_n_954375];
  if (node.type(_child_n_954375) === "GROUP") {
    group_list.push(_child_n_954375);
  }
}
group_count = group_list.length;
MessageLog.trace("NAV: Found " + group_count + " top-level groups.");


for (var n_964533_i = 0; n_964533_i < group_list.length; n_964533_i++) {
    var n_964533_item = group_list[n_964533_i];
    // Check if a NAV_ anchor composite already exists in this group
var _grp_n_983007     = n_964533_item;
var _prefix_n_983007  = "NAV_";
var _parts_n_983007   = _grp_n_983007.split("/");
var _short_n_983007   = _parts_n_983007[_parts_n_983007.length - 1];
var anchor_path        = _grp_n_983007 + "/" + _prefix_n_983007 + _short_n_983007;
var exists             = (node.type(anchor_path) === "COMPOSITE");
MessageLog.trace("NAV: Anchor check " + anchor_path + " -> " + exists);
if (exists) {
    
} else {
    // Find MULTIPORT_OUT inside a group
var _grp_n_016710      = n_964533_item;
var _kids_n_016710     = node.subNodes(_grp_n_016710);
var node_path           = "";
var found               = false;
for (var _i_n_016710 = 0; _i_n_016710 < _kids_n_016710.length; _i_n_016710++) {
  if (node.type(_kids_n_016710[_i_n_016710]) === "MULTIPORT_OUT") {
    node_path = _kids_n_016710[_i_n_016710];
    found     = true;
    break;
  }
}
MessageLog.trace("NAV: MULTIPORT_OUT in " + _grp_n_016710 + " -> " + (found ? node_path : "not found"));
// Plant a NAV_ anchor composite next to a MULTIPORT_OUT
var _grp_n_055785    = n_964533_item;
var _mp_n_055785     = node_path;
var _prefix_n_055785 = "NAV_";
var _offset_n_055785 = 200;
var _parts_n_055785  = _grp_n_055785.split("/");
var _short_n_055785  = _parts_n_055785[_parts_n_055785.length - 1];
var anchor_name       = _prefix_n_055785 + _short_n_055785;
var plant_path_n_055785 = _grp_n_055785 + "/" + anchor_name;
var _ax_n_055785     = node.coordX(_mp_n_055785) + _offset_n_055785;
var _ay_n_055785     = node.coordY(_mp_n_055785);
var _az_n_055785     = node.coordZ(_mp_n_055785);
node.add(_grp_n_055785, anchor_name, "COMPOSITE", _ax_n_055785, _ay_n_055785, _az_n_055785);
MessageLog.trace("NAV: Planted " + plant_path_n_055785);

}
}


// ================================================================
// LAUNCH NAV WINDOW — collects all NAV_ anchors and opens navigator
// ================================================================
var _prefix_n_042675 = "NAV_";
var _title_n_042675  = "NAV TO NODE";

// Scan Top for NAV_ anchor composites
var _anchors_n_042675 = [];
var _topGroups_n_042675 = node.subNodes("Top");
for (var _gi_n_042675 = 0; _gi_n_042675 < _topGroups_n_042675.length; _gi_n_042675++) {
  var _gp_n_042675    = _topGroups_n_042675[_gi_n_042675];
  if (node.type(_gp_n_042675) !== "GROUP") continue;
  var _parts_n_042675 = _gp_n_042675.split("/");
  var _short_n_042675 = _parts_n_042675[_parts_n_042675.length - 1];
  var _apath_n_042675 = _gp_n_042675 + "/" + _prefix_n_042675 + _short_n_042675;
  if (node.type(_apath_n_042675) === "COMPOSITE") {
    _anchors_n_042675.push({
      name:       _short_n_042675,
      anchorPath: _apath_n_042675,
      groupPath:  _gp_n_042675
    });
  }
}

// Sort alphabetically
_anchors_n_042675.sort(function(a, b) { return a.name.localeCompare(b.name); });

if (_anchors_n_042675.length === 0) {
  MessageBox.information("NAV TO NODE — No NAV_ anchors found. Run the scan first.");
} else {
  // Build navigator window
  var _dlg_n_042675 = new QDialog();
  _dlg_n_042675.setWindowTitle(_title_n_042675 + " — " + _anchors_n_042675.length + " groups");
  _dlg_n_042675.resize(300, Math.min(500, 80 + _anchors_n_042675.length * 42));
  _dlg_n_042675.setWindowFlags(Qt.WindowStaysOnTopHint);

  var _lay_n_042675 = new QVBoxLayout();
  _dlg_n_042675.setLayout(_lay_n_042675);

  var _hdr_n_042675 = new QLabel("  " + _anchors_n_042675.length + " navigable groups");
  _hdr_n_042675.setStyleSheet("color: #00d8ff; font-size: 11px; font-weight: bold; padding: 8px; background: #0a0a0a;");
  _lay_n_042675.addWidget(_hdr_n_042675, 0, Qt.AlignTop);

  var _list_n_042675 = new QListWidget();
  _list_n_042675.setStyleSheet(
    "QListWidget { background: #111; border: none; color: #ccc; font-size: 13px; outline: none; }" +
    "QListWidget::item { padding: 10px 14px; border-bottom: 1px solid #1e1e1e; }" +
    "QListWidget::item:hover { background: #1e2a2e; color: #fff; }" +
    "QListWidget::item:selected { background: #0a2030; color: #00d8ff; }"
  );

  for (var _ai_n_042675 = 0; _ai_n_042675 < _anchors_n_042675.length; _ai_n_042675++) {
    var _item_n_042675 = new QListWidgetItem(_anchors_n_042675[_ai_n_042675].name);
    _list_n_042675.addItem(_item_n_042675);
  }
  _lay_n_042675.addWidget(_list_n_042675, 1, Qt.AlignTop);

  var _data_n_042675 = _anchors_n_042675;
  _list_n_042675.itemClicked.connect(function(item) {
    var _clicked_n_042675 = item.text();
    for (var _ni_n_042675 = 0; _ni_n_042675 < _data_n_042675.length; _ni_n_042675++) {
      if (_data_n_042675[_ni_n_042675].name === _clicked_n_042675) {
        var _t_n_042675 = _data_n_042675[_ni_n_042675];
        selection.clearSelection();
        selection.addNodeToSelection(_t_n_042675.groupPath);
        Action.perform("onActionEnterGroup()", "Node View");
        selection.clearSelection();
        selection.addNodeToSelection(_t_n_042675.anchorPath);
        Action.perform("onActionReframeSelection()", "Node View");
        MessageLog.trace("NAV: Jumped to " + _t_n_042675.groupPath);
        break;
      }
    }
  });

  var _close_n_042675 = new QPushButton("Close Navigator");
  _close_n_042675.setStyleSheet(
    "QPushButton { background: #1a1a1a; color: #555; border: 1px solid #2a2a2a; border-radius: 3px; padding: 7px; font-size: 11px; }" +
    "QPushButton:hover { color: #999; background: #252525; }"
  );
  _close_n_042675.clicked.connect(function() { _dlg_n_042675.close(); });
  _lay_n_042675.addWidget(_close_n_042675, 0, Qt.AlignBottom);

  _dlg_n_042675.show();
}



    d.setLayout(layout);
    // d.exec();
}