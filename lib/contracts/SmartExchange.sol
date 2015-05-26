
import "owned";

contract SmartExchange is owned {
	event AnonymousDeposit(address indexed from, uint value);
	event Deposit(address indexed from, bytes32 indexed to, uint value);
	event Transfer(bytes32 indexed from, address indexed to, uint value);
	event IcapTransfer(bytes32 indexed from, address indexed to, bytes32 indirectId, uint value);

	function () {
		AnonymousDeposit(msg.sender, msg.value);
	}

	function deposit(bytes32 to) {
		Deposit(msg.sender, to, msg.value);
	}

	function transfer(bytes32 from, address to, uint value) onlyowner {
		to.send(value);
		Transfer(from, to, value);
	}

	function icapTransfer(bytes32 from, address to, bytes32 indirectId, uint value) onlyowner {
		SmartExchange(to).deposit.value(value)(indirectId); // value?
		IcapTransfer(from, to, indirectId, value);
	}
}

