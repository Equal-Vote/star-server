export {
    transform: {
      '^.+\\.ts?$': [
        'ts-jest',
        {}
      ],
    },
    testPathIgnorePatterns : [
        "/build/*" 
      ],
    modulePathIgnorePatterns :[
        "<rootDir>/build"
    ]
  };
