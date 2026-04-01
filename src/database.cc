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

// ── Init ───────────────────────────────────────────────────────────────────────
Napi::Object Database::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "Database", {
        InstanceMethod("open",  &Database::Open),
        InstanceMethod("close", &Database::Close),
        InstanceMethod("put",   &Database::Put),
        InstanceMethod("get",   &Database::Get),
        InstanceMethod("del",   &Database::Del),
        InstanceMethod("has",   &Database::Has),
        InstanceMethod("size",  &Database::Size),
        InstanceMethod("keys",  &Database::Keys),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("Database", func);
    return exports;
}

// ── Constructor ────────────────────────────────────────────────────────────────
Database::Database(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<Database>(info), db_(nullptr) {}

// ── open(name: string, blockSize: number, blockCount: number) ──────────────────
// Creates or opens a simdb shared-memory database.
// The simdb constructor IS the open operation — it maps the shared memory.
Napi::Value Database::Open(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 3) {
        Napi::TypeError::New(env, "open() requires 3 arguments: name (string), blockSize (number), blockCount (number)")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "open() argument 0 (name) must be a string")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (!info[1].IsNumber()) {
        Napi::TypeError::New(env, "open() argument 1 (blockSize) must be a number")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (!info[2].IsNumber()) {
        Napi::TypeError::New(env, "open() argument 2 (blockCount) must be a number")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string name      = info[0].As<Napi::String>().Utf8Value();
    uint32_t    blockSize = info[1].As<Napi::Number>().Uint32Value();
    uint32_t    blockCount = info[2].As<Napi::Number>().Uint32Value();

    if (blockSize < 64) {
        Napi::RangeError::New(env, "blockSize must be at least 64 bytes")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (blockCount < 1) {
        Napi::RangeError::New(env, "blockCount must be at least 1")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    try {
        db_ = std::make_unique<simdb>(name.c_str(), blockSize, blockCount);
        // simdb only sets m_error when there is an error; on success it is
        // left uninitialised (value 0).  Use blocks() > 0 as the success signal.
        if (db_->blocks() == 0) {
            Napi::Error::New(env, "simdb: failed to open shared memory database")
                .ThrowAsJavaScriptException();
            db_.reset();
        }
    } catch (const std::exception& ex) {
        Napi::Error::New(env, std::string("simdb open error: ") + ex.what())
            .ThrowAsJavaScriptException();
        db_.reset();
    }

    return env.Undefined();
}

// ── close() ────────────────────────────────────────────────────────────────────
Napi::Value Database::Close(const Napi::CallbackInfo& info) {
    if (db_) {
        db_->close();
        db_.reset();
    }
    return info.Env().Undefined();
}

// ── put(key: string, value: string) → boolean ──────────────────────────────────
Napi::Value Database::Put(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!db_) {
        Napi::Error::New(env, "Database is not open — call open() first")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (info.Length() < 2) {
        Napi::TypeError::New(env, "put() requires 2 arguments: key (string), value (string)")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "put() argument 0 (key) must be a string")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (!info[1].IsString()) {
        Napi::TypeError::New(env, "put() argument 1 (value) must be a string")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string key   = info[0].As<Napi::String>().Utf8Value();
    std::string value = info[1].As<Napi::String>().Utf8Value();

    bool ok = db_->put(key, value);
    return Napi::Boolean::New(env, ok);
}

// ── get(key: string) → string | null ──────────────────────────────────────────
Napi::Value Database::Get(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!db_) {
        Napi::Error::New(env, "Database is not open — call open() first")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "get() requires 1 argument: key (string)")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();

    // First check the length of the stored value
    uint32_t vlen = 0;
    int64_t  total = db_->len(key.data(), static_cast<uint32_t>(key.size()), &vlen);

    if (total <= 0 || vlen == 0) {
        return env.Null();
    }

    // Allocate buffer and read value
    std::string result(vlen, '\0');
    bool ok = db_->get(
        key.data(),
        static_cast<uint32_t>(key.size()),
        &result[0],
        vlen
    );

    if (!ok) {
        return env.Null();
    }

    return Napi::String::New(env, result);
}

// ── del(key: string) → boolean ────────────────────────────────────────────────
Napi::Value Database::Del(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!db_) {
        Napi::Error::New(env, "Database is not open — call open() first")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "del() requires 1 argument: key (string)")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();
    bool ok = db_->del(key.data(), static_cast<uint32_t>(key.size()));
    return Napi::Boolean::New(env, ok);
}

// ── has(key: string) → boolean ────────────────────────────────────────────────
Napi::Value Database::Has(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!db_) {
        Napi::Error::New(env, "Database is not open — call open() first")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "has() requires 1 argument: key (string)")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();
    int64_t total = db_->len(key.data(), static_cast<uint32_t>(key.size()), nullptr);
    return Napi::Boolean::New(env, total > 0);
}

// ── size() → number ───────────────────────────────────────────────────────────
// Returns the total shared-memory size in bytes.
Napi::Value Database::Size(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!db_) {
        Napi::Error::New(env, "Database is not open — call open() first")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    uint64_t sz = db_->size();
    return Napi::Number::New(env, static_cast<double>(sz));
}

// ── keys() → string[] ─────────────────────────────────────────────────────────
// Returns all keys currently stored in the database.
Napi::Value Database::Keys(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!db_) {
        Napi::Error::New(env, "Database is not open — call open() first")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    auto keyStrs = db_->getKeyStrs();
    Napi::Array arr = Napi::Array::New(env, keyStrs.size());
    for (size_t i = 0; i < keyStrs.size(); ++i) {
        arr.Set(static_cast<uint32_t>(i), Napi::String::New(env, keyStrs[i].str));
    }
    return arr;
}
