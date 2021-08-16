CREATE TABLE IF NOT EXISTS `escrow`.`escrow_account` (
    `sn` int(11) NOT NULL AUTO_INCREMENT,
    `escrowpub` varchar(100) NOT NULL,
    `escrowsecret` varchar(100) NOT NULL,
    `source` varchar(100) NOT NULL,
    `destination` varchar(100) NOT NULL,
    `time` datetime NOT NULL,
    PRIMARY KEY (`sn`),
    UNIQUE KEY escrowpub (escrowpub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `escrow`.`escrow_transaction` (
    `sn` int(11) NOT NULL AUTO_INCREMENT,
    `operationid` varchar(100) NOT NULL,
    `escrow` varchar(100) NOT NULL,
    `sender` varchar(100) NOT NULL,
    `receiver` varchar(100) NOT NULL,
    `asset` varchar(20) NOT NULL,
    `amount` double NOT NULL,
    `payment_status` int NOT NULL,
    `payment_xdr` varchar(500) NOT NULL,
    `payment_signer` varchar(100) NOT NULL DEFAULT '',
    `refund_status` int  NOT NULL,
    `refund_xdr` varchar(500) NOT NULL,
    `refund_signer` varchar(100) NOT NULL DEFAULT '',
    `time` datetime NOT NULL,
    PRIMARY KEY (`sn`),
    UNIQUE KEY operationid (operationid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;







