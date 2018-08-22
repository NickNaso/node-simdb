{
    "targets" : [
        {
            "target_name" : "simdb",
            "sources" : [
                #"src/binding.cc",
                #"src/database.h",
                #"src/database.cc"
            ],
            'cflags!' : ['-fno-exceptions'],
            'cflags_cc!' : ['-fno-exceptions'],
            'include_dirs' : [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'dependencies' : [
                "<!(node -p \"require('node-addon-api').gyp\")",
                "<(module_root_dir)/src/deps/db/simdb.gyp:libsimdb"
            ],
            'conditions' : [
                [ 'OS=="win"', {
                    "msvs_settings" : {
                        "VCCLCompilerTool" : {
                            "ExceptionHandling" : 1
                        }
                    }
                }],
                [ 'OS=="mac"', {
                    "xcode_settings": {
                        "CLANG_CXX_LIBRARY" : "libc++",
                        'GCC_ENABLE_CPP_EXCEPTIONS' : 'YES',
                        'MACOSX_DEPLOYMENT_TARGET' : '10.7'
                    }
                }]
            ]
        }
    ]
}