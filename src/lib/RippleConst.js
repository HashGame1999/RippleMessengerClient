const XRP2DropRate = 1000 * 1000
const DefaultCoinIssuer = 'Ripple'
const DefaultCoinCode = 'XRP'
const MainNetURL = 'wss://xrplcluster.com'
const MainNetS1URL = 'wss://s1.ripple.com'
const MainNetS2URL = 'wss://s2.ripple.com'
const TestNetURL = 'wss://s.altnet.rippletest.net:51233'
const ServerOptions = [
  { value: MainNetURL, label: `Main Net: ${MainNetURL}` },
  { value: MainNetS1URL, label: `Main Net: ${MainNetS1URL}` },
  { value: MainNetS2URL, label: `Main Net: ${MainNetS2URL}` },
  { value: TestNetURL, label: `Test Net: ${TestNetURL}` }
]

const MasterAddress = 'rBoy4AAAAA9qxv7WANSdP5j5y59NP6soJS'

const CodeColor = {
  0: 'border border-green-500 text-gray-800 dark:text-gray-300',
  1: 'border border-green-500 text-gray-800 dark:text-gray-300',
  2: 'border border-green-500 text-gray-800 bg-yellow-300 text-gray-700',
  3: 'border border-green-500 text-gray-800 bg-yellow-300 text-gray-700',
  4: 'border border-green-500 text-gray-800 bg-yellow-400 text-gray-700',
  5: 'border border-green-500 text-gray-800 bg-indigo-500 text-gray-700'
}

export {
  DefaultCoinIssuer,
  DefaultCoinCode,
  MasterAddress,
  XRP2DropRate,
  MainNetURL,
  TestNetURL,
  ServerOptions,
  CodeColor
}