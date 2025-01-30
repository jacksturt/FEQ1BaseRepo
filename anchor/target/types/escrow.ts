/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/anchor_escrow_q424.json`.
 */
export type Escrow = {
  address: "EScWvgGnQXgHszzc8PLGeRKZWY6DRrnpJybvwCLct4qu";
  metadata: {
    name: "anchorEscrowQ424";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "make";
      discriminator: [138, 227, 232, 77, 223, 166, 96, 197];
      accounts: [
        {
          name: "maker";
          writable: true;
          signer: true;
        },
        {
          name: "mintA";
        },
        {
          name: "mintB";
        },
        {
          name: "makerAtaA";
          pda: {
            seeds: [
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ];
              },
              {
                kind: "account";
                path: "mintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "arg";
                path: "seed";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "escrow";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ];
              },
              {
                kind: "account";
                path: "mintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "seed";
          type: "u64";
        },
        {
          name: "deposit";
          type: "u64";
        },
        {
          name: "receive";
          type: "u64";
        }
      ];
    },
    {
      name: "refund";
      discriminator: [2, 96, 183, 251, 63, 208, 46, 46];
      accounts: [
        {
          name: "maker";
          writable: true;
          signer: true;
          relations: ["escrow"];
        },
        {
          name: "mintA";
          relations: ["escrow"];
        },
        {
          name: "makerAtaA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ];
              },
              {
                kind: "account";
                path: "mintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "account";
                path: "escrow.seed";
                account: "escrow";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "escrow";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ];
              },
              {
                kind: "account";
                path: "mintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "take";
      discriminator: [149, 226, 52, 104, 6, 142, 230, 39];
      accounts: [
        {
          name: "taker";
          writable: true;
          signer: true;
        },
        {
          name: "maker";
          writable: true;
          relations: ["escrow"];
        },
        {
          name: "mintA";
          relations: ["escrow"];
        },
        {
          name: "mintB";
          relations: ["escrow"];
        },
        {
          name: "takerAtaA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "taker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "mintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "takerAtaB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "taker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "mintB";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "makerAtaB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "mintB";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "maker";
              },
              {
                kind: "account";
                path: "escrow.seed";
                account: "escrow";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "escrow";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "mintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "escrow";
      discriminator: [31, 213, 123, 187, 186, 22, 218, 155];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "customError";
      msg: "Custom error message";
    }
  ];
  types: [
    {
      name: "escrow";
      type: {
        kind: "struct";
        fields: [
          {
            name: "seed";
            type: "u64";
          },
          {
            name: "maker";
            type: "pubkey";
          },
          {
            name: "mintA";
            type: "pubkey";
          },
          {
            name: "mintB";
            type: "pubkey";
          },
          {
            name: "recieve";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
  constants: [
    {
      name: "seed";
      type: "string";
      value: '"anchor"';
    }
  ];
};
