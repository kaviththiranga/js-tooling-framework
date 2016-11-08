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
define(['app/ballerina-diagram/models/models'], function (Models) {

    var ProcessorFactory = function (title, center, type, model, viewAttributes, parameters, utils, textModel) {
        var processor;

        if (type === "UnitProcessor") {
            processor = new Models.UnitProcessor({
                title: title,
                centerPoint: center,
                type: type,
                model: model,
                viewAttributes: viewAttributes,
                parameters: parameters,
                utils: utils,
                textModel : textModel
            });
        } else if (type === "ComplexProcessor") {
            processor = new Models.ComplexProcessor({
                title: title,
                centerPoint: center,
                type: type,
                model: model,
                viewAttributes: viewAttributes,
                parameters: parameters,
                utils: utils
            });
        } else if (type === "DynamicContainableProcessor") {
            processor = new Models.DynamicContainableProcessor({
                title: title,
                centerPoint: center,
                type: type,
                model: model,
                viewAttributes: viewAttributes,
                parameters: parameters,
                utils: utils
            });
        } else if (type === "CustomProcessor") {
            processor = new Models.CustomProcessor({
                title: title,
                centerPoint: center,
                type: type,
                model: model,
                viewAttributes: viewAttributes,
                parameters: parameters,
                utils: utils
            });
        }

        processor.type = type;

        return processor;
    };

    return ProcessorFactory;
});
