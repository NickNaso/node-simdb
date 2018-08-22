{
    'targets': [
        {
            'target_name' : 'libsimdb',
            'type': 'static_library',
            'sources': [
                'simdb.cc'
            ],
            'cflags' : [
                '-Wno-unused-but-set-variable'
            ],
            'cflags_cc' : [
                '-Wno-unused-but-set-variable'
            ]
        }
    ]
}