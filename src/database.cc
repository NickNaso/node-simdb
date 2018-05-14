/*******************************************************************************
 * Copyright (c) 2018 Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 ******************************************************************************/

#include "database.h"

Napi::FunctionReference Database::constructor;


Napi::Object Database::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "Database", {
        InstanceMethod("open", &Database::Open)
        InstanceMethod("close", &Database::Close)
        InstanceMethod("size", &Database::Size)
        InstanceMethod("keys", &Database::Keys)
        InstanceMethod("get", &Database::Get)
        InstanceMethod("del", &Database::Del)
        InstanceMethod("put", &Database::Put)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Database", func);
    return exports;
}

Database::Database(const Napi::CallbackInfo& info) 
: Napi::ObjectWrap<Database>(info)  {
    // NOOP
}

Napi::Value Database::Open(const Napi::CallbackInfo& info) {
    return info.Env().Undefined();
}

Napi::Value Database::Close(const Napi::CallbackInfo& info) {
    return info.Env().Undefined();
}

Napi::Value Database::Size(const Napi::CallbackInfo& info) {
    return info.Env().Undefined();
}

Napi::Value Database::Keys(const Napi::CallbackInfo& info) {
    return info.Env().Undefined();
}

Napi::Value Database::Get(const Napi::CallbackInfo& info) {
    return info.Env().Undefined();
}

Napi::Value Database::Del(const Napi::CallbackInfo& info) {
    return info.Env().Undefined();
}

Napi::Value Database::Put(const Napi::CallbackInfo& info) {
    return info.Env().Undefined();
}

