
import "owned";

contract SmartExchange is owned {
	event OnAnonymousDeposit(address indexed from, uint value);
	event OnDeposit(address indexed from, bytes32 indexed to, uint value);
	event OnTransfer(bytes32 indexed from, address indexed to, uint value);
	event OnIcapTransfer(bytes32 indexed from, address indexed to, bytes32 indirectId, uint value);

	function () {
		OnAnonymousDeposit(msg.sender, msg.value);
	}

	function deposit(bytes32 to) {
		OnDeposit(msg.sender, to, msg.value);
	}

	function transfer(bytes32 from, address to, uint value) onlyowner {
		to.send(value);
		OnTransfer(from, to, value);
	}

	function icapTransfer(bytes32 from, address to, bytes32 indirectId, uint value) onlyowner {
		SmartExchange(to).deposit.value(value)(indirectId); // value?
		OnIcapTransfer(from, to, indirectId, value);
	}
}

