/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */



var lifeLineOptions = {};
lifeLineOptions.class = "lifeline";
// Lifeline rectangle options
lifeLineOptions.rect = {};
lifeLineOptions.rect.width = 100;
lifeLineOptions.rect.height = 30;
lifeLineOptions.rect.roundX = 20;
lifeLineOptions.rect.roundY = 20;
lifeLineOptions.rect.class = "lifeline-rect";

// Lifeline middle-rect options
lifeLineOptions.middleRect = {};
lifeLineOptions.middleRect.width = 100;
lifeLineOptions.middleRect.height = 300;
lifeLineOptions.middleRect.roundX = 1;
lifeLineOptions.middleRect.roundY = 1;
lifeLineOptions.middleRect.class = "lifeline-middleRect";

// Lifeline options
lifeLineOptions.line = {};
lifeLineOptions.line.height = 300;
lifeLineOptions.line.class = "lifeline-line";
// Lifeline text options
lifeLineOptions.text = {};
lifeLineOptions.text.class = "lifeline-title";

var createPoint = function (x, y) {
    return new GeoCore.Models.Point({'x': x, 'y': y});
};

var diagramD3el = undefined;

var createLifeLine = function (title, center, cssClass) {
    return new SequenceD.Models.LifeLine({title: title, centerPoint: center, cssClass: cssClass});
};

// Create main tool group
var mainToolGroup = new Tools.Models.ToolGroup({
    toolGroupName: "Main Elements",
    toolGroupID: "main-tool-group"
});

for (var lifeline in MainElements.lifelines) {
    var tool = new Tools.Models.Tool(MainElements.lifelines[lifeline]);
    mainToolGroup.toolCollection.add(tool);
}

// Create mediators tool group
var mediatorsToolGroup = new Tools.Models.ToolGroup({
    toolGroupName: "Mediators",
    toolGroupID: "mediators-tool-group"
});

for (var manipulator in Processors.manipulators) {
    var tool = new Tools.Models.Tool(Processors.manipulators[manipulator]);
    mediatorsToolGroup.toolCollection.add(tool);
}
for (var flowController in Processors.flowControllers) {
    var tool = new Tools.Models.Tool(Processors.flowControllers[flowController]);
    mediatorsToolGroup.toolCollection.add(tool);
}

// Create tool palette
var toolPalette = new Tools.Models.ToolPalatte();
toolPalette.add(mainToolGroup);
toolPalette.add(mediatorsToolGroup);

var paletteView = new Tools.Views.ToolPalatteView({collection: toolPalette});
paletteView.render();

//  TODO refactor and move to proper backbone classes
$(function () {

    $('#tree')
        .jstree({
            'core' : {
                'data' : {
                    'url' : 'http://localhost/?operation=get_node',
                    'data' : function (node) {
                        return { 'id' : node.id };
                    }
                },
                'check_callback' : function(o, n, p, i, m) {
                    if(m && m.dnd && m.pos !== 'i') { return false; }
                    if(o === "move_node" || o === "copy_node") {
                        if(this.get_node(n).parent === this.get_node(p).id) { return false; }
                    }
                    return true;
                },
                'force_text' : true,
                'themes' : {
                    'responsive' : false,
                    'variant' : 'small',
                    'stripes' : true
                }
            },
            'sort' : function(a, b) {
                return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
            },
            'contextmenu' : {
                'items' : function(node) {
                    var tmp = $.jstree.defaults.contextmenu.items();
                    delete tmp.create.action;
                    tmp.create.label = "New";
                    tmp.create.submenu = {
                        "create_folder" : {
                            "separator_after"	: true,
                            "label"				: "Folder",
                            "action"			: function (data) {
                                var inst = $.jstree.reference(data.reference),
                                    obj = inst.get_node(data.reference);
                                inst.create_node(obj, { type : "default" }, "last", function (new_node) {
                                    setTimeout(function () { inst.edit(new_node); },0);
                                });
                            }
                        },
                        "create_file" : {
                            "label"				: "File",
                            "action"			: function (data) {
                                var inst = $.jstree.reference(data.reference),
                                    obj = inst.get_node(data.reference);
                                inst.create_node(obj, { type : "file" }, "last", function (new_node) {
                                    setTimeout(function () { inst.edit(new_node); },0);
                                });
                            }
                        }
                    };
                    if(this.get_type(node) === "file") {
                        delete tmp.create;
                    }
                    return tmp;
                }
            },
            'types' : {
                'default' : { 'icon' : 'folder' },
                'file' : { 'valid_children' : [], 'icon' : 'file' }
            },
            'unique' : {
                'duplicate' : function (name, counter) {
                    return name + ' ' + counter;
                }
            },
            'plugins' : ['state','dnd','sort','types','contextmenu','unique']
        })
        .on('delete_node.jstree', function (e, data) {
            $.get('http://localhost/?operation=delete_node', { 'id' : data.node.id })
                .fail(function () {
                    data.instance.refresh();
                });
        })
        .on('create_node.jstree', function (e, data) {
            $.get('http://localhost/?operation=create_node', { 'type' : data.node.type, 'id' : data.node.parent, 'text' : data.node.text })
                .done(function (d) {
                    data.instance.set_id(data.node, d.id);
                })
                .fail(function () {
                    data.instance.refresh();
                });
        })
        .on('rename_node.jstree', function (e, data) {
            $.get('http://localhost/?operation=rename_node', { 'id' : data.node.id, 'text' : data.text })
                .done(function (d) {
                    data.instance.set_id(data.node, d.id);
                })
                .fail(function () {
                    data.instance.refresh();
                });
        })
        .on('move_node.jstree', function (e, data) {
            $.get('http://localhost/?operation=move_node', { 'id' : data.node.id, 'parent' : data.parent })
                .done(function (d) {
                    //data.instance.load_node(data.parent);
                    data.instance.refresh();
                })
                .fail(function () {
                    data.instance.refresh();
                });
        })
        .on('copy_node.jstree', function (e, data) {
            $.get('http://localhost/?operation=copy_node', { 'id' : data.original.id, 'parent' : data.parent })
                .done(function (d) {
                    //data.instance.load_node(data.parent);
                    data.instance.refresh();
                })
                .fail(function () {
                    data.instance.refresh();
                });
        })
        .on('changed.jstree', function (e, data) {
            if(data && data.selected && data.selected.length) {
                $.get('http://localhost/?operation=get_content&id=' + data.selected.join(':'), function (d) {
                    if(d && typeof d.type !== 'undefined') {
                        $('#data .content').hide();
                        switch(d.type) {
                            case 'text':
                            case 'txt':
                            case 'md':
                            case 'htaccess':
                            case 'log':
                            case 'sql':
                            case 'php':
                            case 'js':
                            case 'json':
                            case 'css':
                            case 'html':
                                $('#data .code').show();
                                $('#code').val(d.content);
                                break;
                            case 'png':
                            case 'jpg':
                            case 'jpeg':
                            case 'bmp':
                            case 'gif':
                                $('#data .image img').one('load', function () { $(this).css({'marginTop':'-' + $(this).height()/2 + 'px','marginLeft':'-' + $(this).width()/2 + 'px'}); }).attr('src',d.content);
                                $('#data .image').show();
                                break;
                            default:
                                $('#data .default').html(d.content).show();
                                break;
                        }
                    }
                });
            }
            else {
                $('#data .content').hide();
                $('#data .default').html('Select a file from the tree.').show();
            }
        });
    var scrWidth = $("#page-content").width();
    var treeContainer = $("#tree-container");
    var rightContainer = $("#right-container");
    //TODO: remove
    treeContainer.resizable({
        ghost: false,
        minWidth: scrWidth / 16,
        maxWidth: scrWidth / 2,
        resize: function (event, el) {
           // rightContainer.css("width", scrWidth - el.size.width);
        }
    });

    var toolContainer = $("#tool-palette");
    var editorContainer = $("#editor-container");
    var propertyContainer = $(".property-container");
    //toolContainer.width(scrWidth / 8);
    toolContainer.resizable({
        ghost: false,
        minWidth: 170,
        maxWidth: rightContainer.width() / 3,
        resize: function (event, el) {
            editorContainer.css("width", rightContainer.innerWidth() - toolContainer.outerWidth(true) - propertyContainer.outerWidth(true));
        }
    });
    //TODO: remove + 1
    // editorContainer.css("padding-left", toolContainer.width() + 1);

    //var $tree = $("#tree");
    //initTree($tree);
    //
    //var removed = false;
    //$("#tree-add-api").on('click',function (e) {
    //    $tree.find("> li > ul").append("<li><input/></li>")
    //    removed = false;
    //    $tree.find('input').focus();
    //});
    //var addApi = function (e) {
    //    if(!removed){
    //        removed = true;
    //        var $input = $tree.find('input');
    //        $input.parent('li').remove();
    //        var name = $input.val();
    //        if(name != ""){
    //            $tree.find("> li > ul").append("<li>" + name + "</li>")
    //        }
    //    }
    //};
    //$tree.on("blur", "input", addApi);
    //$tree.on('keypress', function (e) {
    //    if (e.which === 13) {
    //        addApi(e)
    //    }
    //});

});

// Create the model for the diagram
var diagram = new Diagrams.Models.Diagram({});
var diagramViewElements = [];


selected = "";
selectedModel = "";

//var ppModel = new Editor.Views.PropertyPaneModel();
var ppView = new Editor.Views.PropertyPaneView();
propertyPane = ''; //ppView.createPropertyPane(schema, properties);
endpointLifelineCounter = 0;
resourceLifelineCounter = 0;

function TreeNode(value, type, cStart, cEnd) {
    this.object = undefined;
    this.children = [];
    this.value = value;
    this.type = type;
    this.configStart = cStart;
    this.configEnd = cEnd;

    this.getChildren = function () {
        return this.children;
    };

    this.getValue = function () {
        return this.value;
    };
}

// defining the constants such as the endpoints, this variable need to be positioned properly when restructuring
// This is a map of constants as --> constantType: constantValue
// Ex: HttpEP: "http://localhost/test/test2"
var definedConstants = {};

// Configuring dynamic  tab support
var tab = new Diagrams.Models.Tab({
    resourceId: "seq_1",
    hrefId: "#seq_1",
    resourceTitle: "Resource",
    createdTab: false
});

var tabListView = new Diagrams.Views.TabListView({model: tab});
tabListView.render(tab);
var diagramObj1 = new Diagrams.Models.Diagram({});
tab.addDiagramForTab(diagramObj1);
var tabId1 = tab.get("resourceId");
var linkId1 = tab.get("hrefId");
//Enabling tab activation at page load
$('.tabList a[href="#' + tabId1 + '"]').tab('show');
var dgModel1 = tab.getDiagramOfTab(tab.attributes.diagramForTab.models[0].cid);
dgModel1.CurrentDiagram(dgModel1);
var svgUId1 = tabId1 + "4";
var options = {selector: linkId1, wrapperId: svgUId1};
// get the current diagram view for the tab
var currentView1 = dgModel1.createDiagramView(dgModel1, options);
// set current tab's diagram view as default view
currentView1.currentDiagramView(currentView1);
tab.setDiagramViewForTab(currentView1);
// mark tab as visited
tab.setSelectedTab();
var preview = new Diagrams.Views.DiagramOutlineView({mainView: currentView1});
preview.render();
tab.preview(preview);



