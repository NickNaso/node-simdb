{
    "targets" : [
        {
            "target_name" : "simdb",
            "sources" : [
                "src/binding.cc",
                "src/database.cc"
            ],
            "cflags!" : ["-fno-exceptions"],
            "cflags_cc!" : ["-fno-exceptions"],
            "include_dirs" : [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "dependencies" : [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            "conditions" : [
                [ "OS=='win'", {
                    "msvs_settings" : {
                        "VCCLCompilerTool" : {
                            "ExceptionHandling" : 1
                        }
                    }
                }],
                [ "OS=='mac'", {
                    "cflags+": ["-fvisibility=hidden"],
                    "xcode_settings": {
                        "CLANG_CXX_LIBRARY" : "libc++",
                        "GCC_ENABLE_CPP_EXCEPTIONS" : "YES",
                        "MACOSX_DEPLOYMENT_TARGET" : "10.7",
                        "GCC_SYMBOLS_PRIVATE_EXTERN": "YES", # -fvisibility=hidden
                    }
                }]
            ]
        }
    ]
}