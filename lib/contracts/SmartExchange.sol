
import "owned";

contract SmartExchange is owned {
	event AnonymousDeposit(address from, uint value) anonymous;
	event Deposit(address indexed from, bytes32 indexed to, uint value);
	event Transfer(bytes32 indexed from, address indexed to, uint value);
	event IcapTransfer(bytes32 indexed from, address indexed to, bytes32 indirectId, uint value);

	function anonymousDeposit() {
		emit AnonymousDeposit(msg.sender, msg.value);
	}

	function deposit(bytes32 to) {
		emit Deposit(msg.sender, to, msg.value);
	}

	function transfer(bytes32 from, address to, uint value) onlyowner {
		to.send(value);
		emit Transfer(from, to, value);
	}

	function icapTransfer(bytes32 from, address to, bytes32 indirectId, uint value) onlyowner {
		SmartExchange(to).deposit.value(value)(indirectId); // value?
		emit IcapTransfer(from, to, indirectId, value);
	}
}

