{
    "targets": [
        {
            "target_name": "simdb",
            "sources": [
                "src/binding.cc",
                "src/database.cc"
            ],
            "cflags!":    ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "cflags_cc+": ["-std=c++17"],
            "include_dirs": [
                "<!(node -p \"require('node-addon-api').include_dir\")",
                "deps/simdb/include"
            ],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
            "conditions": [
                ["OS=='linux'", {
                    "libraries": [
                        "<(module_root_dir)/deps/simdb/lib/libsimdb.a",
                        "-lpthread",
                        "-lrt"
                    ],
                    "cflags_cc+": ["-std=c++17"]
                }],
                ["OS=='mac'", {
                    "libraries": [
                        "<(module_root_dir)/deps/simdb/lib/libsimdb.a"
                    ],
                    "cflags+": ["-fvisibility=hidden"],
                    "xcode_settings": {
                        "CLANG_CXX_LIBRARY":  "libc++",
                        "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
                        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
                        "MACOSX_DEPLOYMENT_TARGET":  "10.15",
                        "GCC_SYMBOLS_PRIVATE_EXTERN": "YES"
                    }
                }],
                ["OS=='win'", {
                    "libraries": [
                        "<(module_root_dir)/deps/simdb/lib/simdb.lib"
                    ],
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                            "ExceptionHandling": 1,
                            "AdditionalOptions": ["/std:c++17"]
                        }
                    }
                }],
                ["OS=='freebsd' or OS=='netbsd'", {
                    "libraries": [
                        "<(module_root_dir)/deps/simdb/lib/libsimdb.a",
                        "-lpthread"
                    ],
                    "cflags_cc+": ["-std=c++17"]
                }]
            ]
        }
    ]
}