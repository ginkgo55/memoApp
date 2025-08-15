import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Next.jsアプリへのパスを指定し、テスト環境でnext.config.jsと.envファイルを読み込みます
  dir: './',
})

// Jestに渡すカスタム設定を追加します
/** @type {import('jest').Config} */
const config = {
  // 各テストの前に実行するセットアップオプションを追加します
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // モジュールエイリアスを処理します
    '^@/(.*)$': '<rootDir>/$1',
  },
  // ドキュメントのディレクトリ構成に合わせてテストディレクトリを指定します
  roots: ['<rootDir>/components/__tests__'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
}

// createJestConfigをエクスポートすることで、next/jestが非同期でNext.jsの設定を読み込めるようにします
export default createJestConfig(config)
