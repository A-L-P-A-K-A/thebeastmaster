const Sequelize = require('sequelize');
const queuing = require("./eco-queue.js");
require('sqlite3');
const dbQueue = new queuing();

const sequelize = new Sequelize('database', 'Hot123', '132435465768798', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  operatorsAliases: false,
  storage: 'database.sqlite',
});

const DB = sequelize.define('Economy', {
  userID: {
    type: Sequelize.STRING,
    unique: true,
  },
  wallet: Sequelize.INTEGER,
  bank: Sequelize.INTEGER,
  daily: Sequelize.INTEGER,
});

DB.sync()


console.log(`SQL -> Casino DB Loaded`)
function isNumber(str) {
  if (typeof str != "string") return false // we only process strings!
  // could also coerce to string: str = ""+str
  return !isNaN(str) && !isNaN(parseFloat(str))
}
module.exports = {

  SetBalance: function(UserID, toSet) {
    return dbQueue.addToQueue({
      "value": this._SetBalance.bind(this),
      "args": [UserID, toSet]
    });
  },

  _SetBalance: async function(UserID, toSet) {
    if (!UserID) throw new Error('SetBalance function is missing parameters!')
    if (!toSet && toSet != 0) throw new Error('SetBalance function is missing parameters!')
    if (!parseInt(toSet)) throw new Error('SetBalance function parameter toSet needs to be a number!')
    toSet = parseInt(toSet)

    const SetBalanceProm = new Promise(async (resolve, error) => {

      const Info = await DB.update({
        wallet: toSet
      }, {
        where: {
          userID: UserID
        }
      });
      if (Info > 0) {
        return resolve({
          userid: UserID,
          wallet: toSet
        })
      } else {

        try {
          const Info2 = await DB.create({
            userID: UserID,
            wallet: 0,
			bank: 0,
            daily: 0
          });
          return resolve({
            userid: UserID,
            wallet: toSet
          })
        } catch (e) {
          if (e.name === 'SequelizeUniqueConstraintError') {
            return resolve(`Duplicate Found, shouldn\'t happen in this function, check typo\'s`)
          }
          return error(e)
        }

      }

    });
    return SetBalanceProm;
  },

  AddToBalance: function(UserID, toAdd) {
    return dbQueue.addToQueue({
      "value": this._AddToBalance.bind(this),
      "args": [UserID, toAdd]
    });
  },

  _AddToBalance: async function(UserID, toAdd) {
    if (!UserID) throw new Error('AddToBalance function is missing parameters!')
    if (!toAdd && toAdd != 0) throw new Error('AddToBalance function is missing parameters!')
    if (!parseInt(toAdd)) throw new Error('AddToBalance function parameter toAdd needs to be a number!')
    toAdd = parseInt(toAdd)

    const AddToBalanceProm = new Promise(async (resolve, error) => {

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        const Info2 = await DB.update({
          wallet: Info.wallet + toAdd
        }, {
          where: {
            userID: UserID
          }
        });
        if (Info2 > 0) {
          return resolve({
            userid: UserID,
            oldbalance: Info.wallet,
            newbalance: Info.wallet + toAdd,
          })
        }
        return error('Something went wrong in function AddToBalance')
      }

      return resolve('User has no record in database!')

    });
    return AddToBalanceProm;
  },

  SubstractFromBalance: function(UserID, toSubstract) {
    return dbQueue.addToQueue({
      "value": this._SubstractFromBalance.bind(this),
      "args": [UserID, toSubstract]
    });
  },

  _SubstractFromBalance: async function(UserID, toSubstract) {
    if (!UserID) throw new Error('SubstractFromBalance function is missing parameters!')
    if (!toSubstract && toSubstract != 0) throw new Error('SubstractFromBalance function is missing parameters!')
    if (!parseInt(toSubstract)) throw new Error('SubstractFromBalance function parameter toSubstract needs to be a number!')
    toSubstract = parseInt(toSubstract)

    const SubstractFromBalanceProm = new Promise(async (resolve, error) => {

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        const Info2 = await DB.update({
          wallet: Info.wallet - toSubstract
        }, {
          where: {
            userID: UserID
          }
        });
        if (Info2 > 0) {
          return resolve({
            userid: UserID,
            oldbalance: Info.wallet,
            newbalance: Info.wallet - toSubstract
          })
        }
        return error('Something went wrong in function SubstractFromBalance')
      }

      return resolve('User has no record in database!')

    });
    return SubstractFromBalanceProm;
  },

  FetchBalance: function(UserID) {
    return dbQueue.addToQueue({
      "value": this._FetchBalance.bind(this),
      "args": [UserID]
    });
  },

  _FetchBalance: async function(UserID) {
    if (!UserID) throw new Error('FetchBalance function is missing parameters!')
    const FetchBalanceProm = new Promise(async (resolve, error) => {

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {
        return resolve({
          userid: Info.userID,
          wallet: Info.wallet,
          bank: Info.bank
        })
      }
      try {
        const Info2 = await DB.create({
          userID: UserID,
          wallet: 0,
          bank: 0,
          daily: 0
        });
        return resolve({
          userid: UserID,
          wallet: 0,
		  bank: 0
        })
      } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
          return resolve(`Duplicate Found, shouldn\'t happen in this function, check typo\'s`)
        }
        return error(e)
      }
    });
    return FetchBalanceProm;
  },

  Leaderboard: function(data = {}) {
    return dbQueue.addToQueue({
      "value": this._Leaderboard.bind(this),
      "args": [data]
    });
  },

  _Leaderboard: async function(data) {
    if (data.limit && !parseInt(data.limit)) throw new Error('Leaderboard function parameter obj.limit needs to be a number!')
    if (data.limit) data.limit = parseInt(data.limit)
    if (data.filter && !data.filter instanceof Function) throw new Error('Leaderboard function parameter obj.filter needs to be a function!')
    if (!data.filter) data.filter = x => x;
    const LeaderboardProm = new Promise(async (resolve, error) => {

      if (data.search) {
        const Info = await DB.findAll()

        let output = Info.map(l => (l.userID + '|'+l.wallet+'|'+l.bank+'-' + parseInt(parseInt(l.wallet)+parseInt(l.bank)))).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1])).map(l => new Object({
          userid: l.split('-')[0].split('|')[0],
          wallet: l.split('-')[0].split('|')[1],
          bank: l.split('-')[0].split('|')[2],
          total: parseInt(l.split('-')[0].split('|')[1]) + parseInt(l.split('-')[0].split('|')[2])
        })).filter(data.filter).slice(0, data.limit).findIndex(l => l.userid == data.search)

        if (output == -1) return resolve('Not found')
        return resolve(output + 1)

      } else {

        const Info = await DB.findAll()

        let output = Info.map(l => (l.userID + '|'+l.wallet+'|'+l.bank+'-' + parseInt(parseInt(l.wallet)+parseInt(l.bank)))).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1])).map(l => new Object({
          userid: l.split('-')[0].split('|')[0],
          wallet: l.split('-')[0].split('|')[1],
          bank: l.split('-')[0].split('|')[2],
          total: parseInt(l.split('-')[0].split('|')[1]) + parseInt(l.split('-')[0].split('|')[2])
        })).filter(data.filter).slice(0, data.limit)
		
        return resolve(output)

      }

    });
    return LeaderboardProm;
  },
  
  ResetAllUsers: function(data = {}) {
    return dbQueue.addToQueue({
      "value": this._ResetAllUsers.bind(this),
      "args": [data]
    });
  },

  _ResetAllUsers: async function(data) {
    const ResetAllUsersProm = new Promise(async (resolve, error) => {

      const Info = await DB.findAll()

        let output = Info.map(l => (l.userID)).sort((a, b) => parseInt(b) - parseInt(a));
		for (var i = 0; i < output.length; i++) {
			const Info3 = await DB.findOne({
				where: {
				  userID: output[i]
				}
			  });
			  if (Info3) {

				const Info2 = await DB.update({
				  wallet: 0,
				  bank: 0
				}, {
				  where: {
					userID: output[i]
				  }
				});
			  } 
		}
        return resolve(output)

    });
    return ResetAllUsersProm;
  },

  Daily: function(UserID) {
    return dbQueue.addToQueue({
      "value": this._Daily.bind(this),
      "args": [UserID]
    });
  },

  _Daily: async function(UserID) {
    if (!UserID) throw new Error('Daily function is missing parameters!')
    const DailyProm = new Promise(async (resolve, error) => {

      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //Januari is 0;
      var yyyy = today.getFullYear();

      var now = new Date(`${mm} ${dd}, ${yyyy}`)
      var nextDay = now.setDate(now.getDate() + 1);

      var difference = nextDay - today.getTime();

      var days = Math.floor(difference / (1000 * 60 * 60 * 24));
      var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      today = mm + dd + yyyy;


      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        if (Info.daily != today) {
          const Info2 = await DB.update({
            daily: today
          }, {
            where: {
              userID: UserID
            }
          });
          if (Info2 > 0) {
            return resolve({
              userid: Info.userID,
              updated: true
            })
          }
        } else {
          return resolve({
            userid: Info.userID,
            updated: false,
            timetowait: days + "d " + hours + "h " + minutes + "m " + seconds + "s"
          })
        }
      }
      try {
        const Info3 = await DB.create({
          userID: UserID,
          wallet: 0,
          bank: 0,
          daily: today
        });
        return resolve({
          userid: UserID,
          updated: true
        })
      } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
          return resolve(`Duplicate Found, shouldn\'t happen in this function, check typo\'s`)
        }
        return error(e)
      }
    });
    return DailyProm;
  },

  Transfer: function(FromUser, ToUser, Amount) {
    return dbQueue.addToQueue({
      "value": this._Transfer.bind(this),
      "args": [FromUser, ToUser, Amount]
    });
  },

  _Transfer: async function(FromUser, ToUser, Amount) {
    if (!FromUser || !ToUser || !Amount) throw new Error('Transfer function is missing parameters!')
    if (!parseInt(Amount)) throw new Error('Transfer function parameter Amount needs to be a number!')
	if (Amount <= 0) return;
    Amount = parseInt(Amount)

    const TransferProm = new Promise(async (resolve, error) => {

      const Info = await DB.findOne({
        where: {
          userID: FromUser
        }
      });
      if (Info) {

        if (Info.wallet < Amount) {
          throw new Error('The user that transfers has insufficient funds.')
          return
        }

        const Info6 = await DB.update({
          wallet: Info.wallet - Amount
        }, {
          where: {
            userID: FromUser
          }
        });

        const Info2 = await DB.findOne({
          where: {
            userID: ToUser
          }
        });
        if (Info2) {

          const Info3 = await DB.update({
            wallet: Info2.wallet + Amount
          }, {
            where: {
              userID: ToUser
            }
          });
          if (Info3 > 0) {

            return resolve({
              FromUser: Info.balance - Amount,
              ToUser: Info2.balance + Amount
            })
          }
          return error('Something went wrong in function Transfer')
        } else {
          try {
            const Info5 = await DB.create({
              userID: ToUser,
              wallet: Amount,
              bank: 0,
              daily: 0
            });
            return resolve({
              FromUser: Info.wallet - Amount,
              ToUser: Amount
            })
          } catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
              return resolve(`Duplicate Found, shouldn\'t happen in this function, check typo\'s`)
            }
            return error(e)
          }
        }
      }
      throw new Error('The user that transfers has insufficient funds.')
    });
    return TransferProm;
  },
  
  TransferToBank: function(UserID, Amount) {
    return dbQueue.addToQueue({
      "value": this._TransferToBank.bind(this),
      "args": [UserID, Amount]
    });
  },

  _TransferToBank: async function(UserID, Amount) {
    if (!UserID || !Amount) throw new Error('TransferToBank function is missing parameters!')
    if (!parseInt(Amount)) throw new Error('TransferToBank function parameter Amount needs to be a number!')
	if (Amount <= 0) return;
    Amount = parseInt(Amount)

    const TransferProm = new Promise(async (resolve, error) => {

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        if (Info.wallet < Amount) {
          throw new Error('The user that transfers has insufficient funds.')
          return
        }

        const Info6 = await DB.update({
          wallet: Info.wallet - Amount,
          bank: Info.bank + Amount
        }, {
          where: {
            userID: UserID
          }
        });
		if (Info6 > 0) {

			return resolve({
				newbalance: Info.bank + Amount
			})
	    }
	    return error('Something went wrong in function TransferToBank')
      }
      throw new Error('The user that transfers has insufficient funds.')
    });
    return TransferProm;
  },
  TransferToWallet: function(UserID, Amount) {
    return dbQueue.addToQueue({
      "value": this._TransferToWallet.bind(this),
      "args": [UserID, Amount]
    });
  },

  _TransferToWallet: async function(UserID, Amount) {
    if (!UserID || !Amount) throw new Error('TransferToWallet function is missing parameters!')
    if (!parseInt(Amount)) throw new Error('TransferToWallet function parameter Amount needs to be a number!')
	if (Amount <= 0) return;
    Amount = parseInt(Amount)

    const TransferProm = new Promise(async (resolve, error) => {

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        if (Info.bank < Amount) {
          throw new Error('The user that transfers has insufficient funds.')
          return
        }

        const Info6 = await DB.update({
          wallet: Info.wallet + Amount,
          bank: Info.bank - Amount
        }, {
          where: {
            userID: UserID
          }
        });
		if (Info6 > 0) {

			return resolve({
				newbalance: Info.wallet + Amount
			})
	    }
	    return error('Something went wrong in function TransferToBank')
      }
      throw new Error('The user that transfers has insufficient funds.')
    });
    return TransferProm;
  },

  Coinflip: function(UserID, Flip, Input) {
    return dbQueue.addToQueue({
      "value": this._Coinflip.bind(this),
      "args": [UserID, Flip, Input]
    });
  },

  _Coinflip: async function(UserID, Flip, Input) {
    Flip = Flip.toLowerCase()
    if (!UserID || !Flip || !Input) throw new Error('Coinflip function is missing parameters!')
    if (Flip != 'tails' && Flip != 'heads') throw new Error('Coinflip second parameter needs to be [tails  or heads]')
    if (!parseInt(Input)) throw new Error('Coinflip function parameter Input needs to be a number!')
    Input = parseInt(Input)

    const CoinflipProm = new Promise(async (resolve, error) => {

      const random = ['tails', 'heads']
      const output = random[Math.floor(Math.random() * 2)]

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        if (Info.wallet < Input) {
          return
        }

        if (Flip != output) {
          const Info2 = await DB.update({
            wallet: Info.wallet - Input
          }, {
            where: {
              userID: UserID
            }
          });
          if (Info2 > 0) {
            return resolve({
              userid: UserID,
              oldbalance: Info.wallet,
              newbalance: Info.wallet - Input,
              output: 'lost'
            })
          }
          return error('Something went wrong in function Coinflip')
        } else {
          const Info3 = await DB.update({
            wallet: Info.wallet + Input
          }, {
            where: {
              userID: UserID
            }
          });
          if (Info3 > 0) {

            return resolve({
              userid: UserID,
              oldbalance: Info.wallet,
              newbalance: Info.wallet + Input,
              output: 'won'
            })
          }
          return error('Something went wrong in function Coinflip')
        }

      }
      throw new Error('The user has insufficient funds.')

    });
    return CoinflipProm;
  },

  Dice: function(UserID, DiceNumber, Input) {
    return dbQueue.addToQueue({
      "value": this._Dice.bind(this),
      "args": [UserID, DiceNumber, Input]
    });
  },

  _Dice: async function(UserID, DiceNumber, Input) {
    if (!UserID || !DiceNumber || !Input) throw new Error('Dice function is missing parameters!')
    if (!parseInt(DiceNumber) || ![1, 2, 3, 4, 5, 6].includes(parseInt(DiceNumber))) throw new Error('The Dice number should be 1-6')
    if (!parseInt(Input)) throw new Error('Dice function parameter Input needs to be a number!')
    Input = parseInt(Input)
    DiceNumber = parseInt(DiceNumber)

    const DiceProm = new Promise(async (resolve, error) => {

      const output = Math.floor((Math.random() * 6) + 1);

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        if (Info.wallet < Input) {
          throw new Error('The user has insufficient funds.')
          return
        }

        if (DiceNumber != output) {
          const Info2 = await DB.update({
            wallet: Info.wallet - Input
          }, {
            where: {
              userID: UserID
            }
          });
          if (Info2 > 0) {
            return resolve({
              userid: UserID,
              oldbalance: Info.wallet,
              newbalance: Info.wallet - Input,
              guess: DiceNumber,
              dice: output,
              output: 'lost'
            })
          }
          return error('Something went wrong in function Dice')
        } else {
          const Info3 = await DB.update({
            wallet: Info.wallet + Input
          }, {
            where: {
              userID: UserID
            }
          });
          if (Info3 > 0) {

            return resolve({
              userid: UserID,
              oldbalance: Info.wallet,
              newbalance: Info.wallet + Input,
              guess: DiceNumber,
              dice: output,
              output: 'won'
            })
          }
          return error('Something went wrong in function Dice')
        }

      }
      throw new Error('The user has insufficient funds.')

    });
    return DiceProm;
  }, 
  
  Roulette: function(UserID, Type, Input) {
    return dbQueue.addToQueue({
      "value": this._Roulette.bind(this),
      "args": [UserID, Type, Input]
    });
  },

  _Roulette: async function(UserID, DiceNumber, Input) {
    if (!UserID || !DiceNumber || !Input) throw new Error('Roulette function is missing parameters!')
    //if (!parseInt(DiceNumber) || ![1, 2, 3, 4, 5, 6].includes(parseInt(DiceNumber))) throw new Error('The Roulette number should be 1-6')
    if (!parseInt(Input)) throw new Error('Dice function parameter Input needs to be a number!')
    Input = parseInt(Input)
    DiceNumber = DiceNumber

    const DiceProm = new Promise(async (resolve, error) => {

      const output = Math.floor((Math.random() * 36) + 1);

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        if (Info.wallet < Input) {
          throw new Error('The user has insufficient funds.')
          return
        }
		function isEven(n) {
		  n = Number(n);
		  return n === 0 || !!(n && !(n%2));
		}

		function isOdd(n) {
		  return isEven(Number(n) + 1);
		}
		var rwon = false;
		if (DiceNumber == 'even') {
			if (isEven(output)) {
				rwon = true;
			}
		}
		if (DiceNumber == 'odd') {
			if (isOdd(output)) {
				rwon = true;
			}
		}
		if (isNumber(DiceNumber) && parseInt(DiceNumber) == output) {
			rwon = true;
		}
        if (!rwon) {
          const Info2 = await DB.update({
            wallet: Info.wallet - Input
          }, {
            where: {
              userID: UserID
            }
          });
          if (Info2 > 0) {
            return resolve({
              userid: UserID,
              oldbalance: Info.wallet,
              newbalance: Info.wallet - Input,
              guess: DiceNumber,
              roulette: output,
              output: 'lost'
            })
          }
          return error('Something went wrong in function Dice')
        } else {
          const Info3 = await DB.update({
            wallet: Info.wallet + Input
          }, {
            where: {
              userID: UserID
            }
          });
          if (Info3 > 0) {

            return resolve({
              userid: UserID,
              oldbalance: Info.wallet,
              newbalance: Info.wallet + Input,
              guess: DiceNumber,
              roulette: output,
              output: 'won'
            })
          }
          return error('Something went wrong in function Dice')
        }

      }
      throw new Error('The user has insufficient funds.')

    });
    return DiceProm;
  },

  Delete: function(UserID) {
    return dbQueue.addToQueue({
      "value": this._Delete.bind(this),
      "args": [UserID]
    });
  },

  _Delete: async function(UserID) {
    if (!UserID) throw new Error('Delete function is missing parameters!')

    const DeleteProm = new Promise(async (resolve, error) => {

      const Info = await DB.destroy({
        where: {
          userID: UserID
        }
      });
      if (Info) {
        return resolve({
          deleted: true
        })
      }

      return resolve({
        deleted: false
      })

    });
    return DeleteProm;
  },

  ResetDaily: function(UserID) {
    return dbQueue.addToQueue({
      "value": this._ResetDaily.bind(this),
      "args": [UserID]
    });
  },

  _ResetDaily: async function(UserID) {
    if (!UserID) throw new Error('ResetDaily function is missing parameters!')

    const ResetDailyProm = new Promise(async (resolve, error) => {

      const Info = await DB.update({
        daily: 0
      }, {
        where: {
          userID: UserID
        }
      });
      if (Info > 0) {
        return resolve(`Daily Reset.`);
      } else {

        try {
          const Info2 = await DB.create({
            userID: UserID,
            balance: 0,
            daily: 0
          });
          return resolve(`Daily Reset.`)
        } catch (e) {
          if (e.name === 'SequelizeUniqueConstraintError') {
            return resolve(`Duplicate Found, shouldn\'t happen in this function, check typo\'s`)
          }
          return error(e)
        }

      }

    });
    return ResetDailyProm;
  },

  Work: function(UserID, data = {}) {
    return dbQueue.addToQueue({
      "value": this._Work.bind(this),
      "args": [UserID, data]
    });
  },

  _Work: async function(UserID, data = {}) {
    if (!UserID) throw new Error('Work function is missing parameters!')
    if (data.jobs && !Array.isArray(data.jobs)) throw new Error('Work function parameter data.jobs is not an array!')
    if (data.money && !parseInt(data.money)) throw new Error('Work function parameter data.money needs to be a number!')
    if (data.failurerate && !parseInt(data.failurerate)) throw new Error('Work function parameter data.failurerate needs to be a number!')
    if (data.failurerate) data.failurerate = parseInt(data.failurerate)
    if (data.failurerate && data.failurerate < 0 || data.failurerate > 100) throw new Error('Work function parameter data.failurerate needs to be a number! between 0-100')
    if (data.money) data.money = parseInt(data.money)

    if (!data.jobs) data.jobs = ["Miner", "Bartender", "Cashier", "Cleaner", "Drugdealer", "Assistant", "Nurse", "Cleaner", "Teacher", "Accountants", "Security Guard", "Sheriff", "Lawyer", "Dishwasher", "Electrician", "Singer", "Dancer"];
    if (!data.money) data.money = Math.floor(Math.random() * 101)
    if (!data.failurerate) data.failurerate = 50

    var success = true;

    var randomnumber = Math.random()
    if (randomnumber <= data.failurerate / 100) success = false;

    const WorkProm = new Promise(async (resolve, error) => {

      const Info = await DB.findOne({
        where: {
          userID: UserID
        }
      });
      if (Info) {

        if (success) {

          const Info2 = await DB.update({
            wallet: Info.wallet + data.money
          }, {
            where: {
              userID: UserID
            }
          });

          if (Info2 > 0) {
            return resolve({
              userid: Info.userID,
              earned: data.money,
              job: data.jobs[Math.floor(Math.random() * data.jobs.length)],
              wallet: Info.wallet + data.money
            })
          }

        } else {
          return resolve({
            userid: Info.userID,
            earned: 0,
            job: data.jobs[Math.floor(Math.random() * data.jobs.length)],
            wallet: Info.wallet
          })
        }

      }

      try {
        if (!success) data.money = 0;

        const Info3 = await DB.create({
          userID: UserID,
          wallet: data.money,
          bank: 0,
          daily: 0
        });
        return resolve({
          userid: UserID,
          earned: data.money,
          job: data.jobs[Math.floor(Math.random() * data.jobs.length)],
          wallet: data.money,
          bank: 0
        })
      } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
          return resolve(`Duplicate Found, shouldn\'t happen in this function, check typo\'s`)
        }
        return error(e)
      }
    });
    return WorkProm;
  }

}
