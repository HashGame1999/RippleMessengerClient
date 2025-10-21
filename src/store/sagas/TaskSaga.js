import { fork, select, cancelled, delay } from 'redux-saga/effects'
import { ConnectSwitch } from './MessengerSaga'

export function* taskInstant() {
  const interval = 3 * 1000
  try {
    while (true) {

      const seed = yield select(state => state.User.Seed)
      if (seed) {
        yield fork(ConnectSwitch)
      }


      yield delay(interval)
    }
  } finally {
    if (yield cancelled()) {
      console.log('Scheduled taskInstant cancelled...')
    }
  }
}

export function* taskFast() {
  const interval = 10 * 1000
  try {
    while (true) {
      yield delay(interval)
    }
  } finally {
    if (yield cancelled()) {
      console.log('Scheduled taskFast cancelled...')
    }
  }
}

export function* taskSlow() {
  const interval = 30 * 1000
  try {
    while (true) {
      const address = yield select(state => state.User.Address)
      if (address) {
      }
      yield delay(interval)
    }
  } finally {
    if (yield cancelled()) {
      console.log('Scheduled taskSlow cancelled...')
    }
  }
}