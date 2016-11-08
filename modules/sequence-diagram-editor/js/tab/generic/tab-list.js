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
define(function (require) {

    var backbone = require("backbone"),
        jquery = require("jquery"),
        _ = require("lodash"),
        tabList;

    tabList = backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
            if(!_.isUndefined(this.options.tabModel)){
                var TabCollection = backbone.Collection.extend({
                    model: this.options.tabModel
                });
                this.tab = new TabCollection();
            }
            if(_.isUndefined(this.options.selector)){
                logger.error("Cannot find element selector for rendering tab list view.");
            }
        },
        render: function () {
        },
        addTab: function(tab){
            this.tabs.add(tab);
            this.trigger("tab-added", tab);
        },
        getTab: function(tabId){
            return this.tabs.get(tabId);
        }
    });

    return tabList;
});