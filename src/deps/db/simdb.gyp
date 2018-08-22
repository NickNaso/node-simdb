{
    'targets': [
        {
            'target_name' : 'libsimdb',
            'type': 'static_library',
            'sources': [
                'simdb.cc'
            ],
            'cflags': [
                '-w'
            ],
            'cflags_cc': [
                '-w'
            ],
            "conditions": [
                ['OS=="mac"', {
                    "xcode_settings": {
                        "CLANG_CXX_LIBRARY" : "libc++",
                        'GCC_ENABLE_CPP_EXCEPTIONS' : 'YES',
                        'MACOSX_DEPLOYMENT_TARGET' : '10.7',
                        'WARNING_CFLAGS': [
                            '-Wno-ignored-qualifiers',
                            '-Wno-unused-variable',
                            '-Wno-pessimizing-move',
                            '-Wno-unused-private-field'
                        ]
                    }
                }],
                ['OS=="win"', {
                    
                }]
            ]
        }
    ]
}