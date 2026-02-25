import { getHuaweiConfig, initializeHuaweiPushKit } from './huaweiPushService';

describe('Huawei Push Service', () => {
  beforeAll(() => {
    process.env.HUAWEI_DEVELOPER_ID = '30027000029499529';
    process.env.HUAWEI_PUBLIC_KEY = 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAs8tpxGGg0LVm3mPhN5xWBLFnCrMaE8nONn/UnP68QeBodJ88fxAfAqvCIhRCwtEcF8/z7rj4ZIyPzL3adP1yPmByH71WnR3YZawM7v8X3JRwjFXQWDozw6e5Z4iXjiIx0BN5dZrnyLMqqVXUfumhleqMbxqtyW7Qk0DUxuXnV3YdPisJ7kuGtibv2EACfTt3608UAq+xOmLVVb8+rUsK5SUno8JU+KmHMKw6vlu6gHE4dtRZZI1KArpdZSWCIZFTlATSguAUDX7KEwCkCWCKKxSgmoDfYhnkID8i4za9Iv5uK85wOEOiD+AaZfOiqMebzq/kEUgCVLE6mvLfPbHQV0T2XN7i62kcNT6e7Bc7VEiVycp5BRBgYat/g73tGQKS6QuFfHtDmJQlS6PxjMsqaPhsJKP6Z1lHcJNl4+UsUHInWg47cX0jnDaEK8LS1JWKfUvbJuTrzPhF2Cff/oZZnAgjXLYZhnsSAePZoTIAqs2yrBLcemhxOEongl/YAZCZAgMBAAE=';
    process.env.HUAWEI_PROJECT_NAME = 'Educater';
    process.env.HUAWEI_PROJECT_ID = '101653523863538721';
    process.env.HUAWEI_DATA_LOCATION = 'Singapore';
    process.env.HUAWEI_CLIENT_ID = '1877714599654983488';
    process.env.HUAWEI_CLIENT_SECRET = 'F456383B87DC6B7A3064A793ADB9E9BDB6903C3F2DE0B1FB63D91736E9F3C459';
    process.env.HUAWEI_API_KEY = 'DgEDAK4mZWG/nrE8+O0JIuLu6i0TeBHsncDUFjiWnOGPG0Wm1h3xFNrEJIzdUoqmhSUV/khPV7RJP83lIr7Zb3UQOwUgtYtieMyZog==';
    process.env.HUAWEI_PACKAGE_NAME = 'za.co.educater.app';
    process.env.HUAWEI_APP_ID = '116819743';
    process.env.HUAWEI_OAUTH_CLIENT_ID = '116819743';
    process.env.HUAWEI_OAUTH_CLIENT_SECRET = '16f2edae0457fa67dfc71df33e49a66f957df3b713f9ff624d737bdd810e2b17';
  });

  it('should load Huawei configuration from environment variables', () => {
    const config = getHuaweiConfig();
    expect(config).toEqual({
      developerId: '30027000029499529',
      publicKey: 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAs8tpxGGg0LVm3mPhN5xWBLFnCrMaE8nONn/UnP68QeBodJ88fxAfAqvCIhRCwtEcF8/z7rj4ZIyPzL3adP1yPmByH71WnR3YZawM7v8X3JRwjFXQWDozw6e5Z4iXjiIx0BN5dZrnyLMqqVXUfumhleqMbxqtyW7Qk0DUxuXnV3YdPisJ7kuGtibv2EACfTt3608UAq+xOmLVVb8+rUsK5SUno8JU+KmHMKw6vlu6gHE4dtRZZI1KArpdZSWCIZFTlATSguAUDX7KEwCkCWCKKxSgmoDfYhnkID8i4za9Iv5uK85wOEOiD+AaZfOiqMebzq/kEUgCVLE6mvLfPbHQV0T2XN7i62kcNT6e7Bc7VEiVycp5BRBgYat/g73tGQKS6QuFfHtDmJQlS6PxjMsqaPhsJKP6Z1lHcJNl4+UsUHInWg47cX0jnDaEK8LS1JWKfUvbJuTrzPhF2Cff/oZZnAgjXLYZhnsSAePZoTIAqs2yrBLcemhxOEongl/YAZCZAgMBAAE=',
      projectName: 'Educater',
      projectId: '101653523863538721',
      dataLocation: 'Singapore',
      clientId: '1877714599654983488',
      clientSecret: 'F456383B87DC6B7A3064A793ADB9E9BDB6903C3F2DE0B1FB63D91736E9F3C459',
      apiKey: 'DgEDAK4mZWG/nrE8+O0JIuLu6i0TeBHsncDUFjiWnOGPG0Wm1h3xFNrEJIzdUoqmhSUV/khPV7RJP83lIr7Zb3UQOwUgtYtieMyZog==',
      packageName: 'za.co.educater.app',
      appId: '116819743',
      oauthClientId: '116819743',
      oauthClientSecret: '16f2edae0457fa67dfc71df33e49a66f957df3b713f9ff624d737bdd810e2b17',
    });
  });

  it('should initialize Huawei Push Kit without errors', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    await initializeHuaweiPushKit();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Initializing Huawei Push Kit with the following config:',
      expect.any(Object)
    );
  });
});