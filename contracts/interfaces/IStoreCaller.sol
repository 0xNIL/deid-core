// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IStoreCaller
 * @author Francesco Sullo <francesco@sullo.co>
 */


interface IStoreCaller {
    event StoreSet(address indexed _store);

    function setStore(address store_) external;

}
