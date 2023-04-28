export function walletAddressShortForm(value) {
  return value.substr(0, 5) + "...." + value.substr(-4);
}

export function transactionHashShortForm(value) {
  return value.substr(0, 6) + "...." + value.substr(-4);
}
