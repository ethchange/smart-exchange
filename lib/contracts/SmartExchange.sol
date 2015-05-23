import "owned";

contract SmartExchange is owned {
	event OnAnonymousDeposit(address indexed from, uint value);
	event OnDeposit(address indexed from, bytes indexed to, uint value);
	event OnTransfer(bytes indexed from, address indexed to, uint value);
	event OnIcapTransfer(bytes indexed from, address indexed to, bytes indirectId, uint value);

	function () {
		OnAnonymousDeposit(msg.sender, msg.value);
	}

	function deposit(bytes32 to) {
		OnDeposit(msg.sender, to, msg.value);
	}

	function transfer(bytes32 from, address to, uint value) onlyowner {
		to.send(value);
		onTransfer(from, to, value);
	}

	function icapTransfer(bytes32 from, address to, bytes32 indirectId, uint value) onlyowner {
		SmartExchange(to).deposit.value(value)(indirectId); // value?
		OnIcapTransfer(from, to, indirectId, value);
	}
}
