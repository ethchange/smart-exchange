//sol FixedFeeRegistrar
// Simple global registrar with fixed-fee reservations.
// @authors:
//   Gav Wood <g@ethdev.com>

contract TinyFixedFeeRegistrar {
	event Changed(bytes32 indexed name);

	struct Record {
		address addr;
		address owner;
	}

	modifier onlyrecordowner(bytes32 _name) { if (m_record[_name].owner == msg.sender) _ }

	function reserve(bytes32 _name) {
	    Record rec = m_record[_name];
		if (rec.owner == 0 && msg.value >= c_fee) {
			rec.owner = msg.sender;
			Changed(_name);
		}
	}
	function disown(bytes32 _name, address _refund) onlyrecordowner(_name) {
		delete m_record[_name];
		_refund.send(c_fee);
		Changed(_name);
	}

	function transfer(bytes32 _name, address _newOwner) onlyrecordowner(_name) {
		m_record[_name].owner = _newOwner;
		Changed(_name);
	}

	function setAddr(bytes32 _name, address _a) onlyrecordowner(_name) {
		m_record[_name].addr = _a;
		Changed(_name);
	}
	
	function record(bytes32 _name) constant returns (address o_addr, address o_owner) {
	    Record rec = m_record[_name];
		o_addr = rec.addr;
		o_owner = rec.owner;
	}

	function addr(bytes32 _name) constant returns (address) { return m_record[_name].addr; }
	function owner(bytes32 _name) constant returns (address) { return m_record[_name].owner; }

    mapping (bytes32 => Record) m_record;
    uint constant c_fee = 69 ether;
}
