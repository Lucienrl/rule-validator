export enum STATUS {
	SUCCESS = 0,
	ERROR = 1,
}

// 内置code
export enum CODE {
	// ok
	SUCCESS = '0',
	// 空值
	EMPTY_VALUE = 'EMPTY_VALUE',
	// 太短
	TOO_SHORT = 'TOO_SHORT',
	// 太长
	TOO_LONG = 'TOO_LONG',
	// 不合法的内容
	ILLEGAL_CHARACTER = 'ILLEGAL_CHARACTER',
	// 未知错误
	UNKNOWN_TYPE = 'UNKNOWN_TYPE',
}
