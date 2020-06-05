const task = async (usersQuantity, isNeededDetails) => {
	// generate data for task
	let users = []
	let usersToExport = []
	let genderPreferencesMale = []
	let genderPreferencesFemale = []

	const prepareData = () => {
		const createUsers = n => {
			// randomise user object
			for (let i = 0; i < n; i++) {
				const user = {
					id: i + 1,
					gender: Math.round(Math.random()),
				}

				const items = []
				const itemsLength = Math.round(Math.random() * 5)
				while (items.length < itemsLength) {
					const value = `Item ${[Math.ceil(Math.random() * 20)]}`
					// items-uniqueness check
					if (items.indexOf(value) === -1) {
						items.push(value)
					}
				}
				user.items = items

				users.push(user)
			}
			return users
		}
		users = createUsers(usersQuantity)

		// export users without items information
		usersToExport = users.map(e => {
			return { gender: e.gender, id: e.id }
		})

		// prepare male/female array of most preferenced items
		const preparePreferences = genderId => {
			// filter bu gender
			const usersByGender = users.filter(e => e.gender === genderId)
			let items = []

			// create an array with all elements in a row
			usersByGender.forEach(e => {
				items = items.concat(e.items)
			})
			// randomise top list length (2-5 elements)
			const length = Math.round(Math.random() * 3)
			return sortByQuantity(items, 2 + length)
		}
		genderPreferencesMale = preparePreferences(1)
		genderPreferencesFemale = preparePreferences(0)
	}
	prepareData(usersQuantity)

	// settimeout function to simulate answer from serwer
	function timeout() {
		return new Promise(resolve => setTimeout(resolve, 1000))
	}

	// 3 default functions
	async function getUsers() {
		await timeout()
		return usersToExport
	}
	async function getPreferences(userId) {
		await timeout()
		return users.filter(e => e.id === userId)[0].items
	}
	async function getGenderPreferences(gender) {
		await timeout()
		return gender ? genderPreferencesMale : genderPreferencesFemale
	}

	// solution
	async function getTop(num, details) {
		// get all users array
		const allUsers = await getUsers()
		// get female preferences array
		const maleItems = await getGenderPreferences(1)
		// get male preferences array
		const femaleItems = await getGenderPreferences(0)
		const preferencesByGender = [femaleItems, maleItems]

		// get every user preferences by Ids
		const promises = allUsers.map(e => getPreferences(e.id))
		let itemsByIds = await Promise.all(promises)

		// expand users preferences array with default values for male/female
		itemsByIds.forEach((e, index) => {
			const preferencesByUserGender =
				preferencesByGender[allUsers[index].gender]
			for (let i = 0; i < 5 && e.length < 5; i++) {
				if (
					preferencesByUserGender[i] &&
					e.indexOf(preferencesByUserGender[i]) === -1
				) {
					e.push(preferencesByUserGender[i])
				}
			}
		})

		// filter users with not enough items ( <5)
		itemsByIds = itemsByIds.filter(e => e.length === 5)

		// create an array with all elements in a row
		let items = []
		itemsByIds.forEach(e => {
			items = items.concat(e)
		})

		return sortByQuantity(items, num, details)
	}

	function sortByQuantity(array, numberOfItemsToDisplay, detailedInfo) {
		// create object with quantity information
		const quantityObject = {}
		array.forEach(item =>
			quantityObject[item]
				? quantityObject[item]++
				: (quantityObject[item] = 1),
		)

		// sort by quantity
		const sortable = []
		for (const element in quantityObject) {
			sortable.push([element, quantityObject[element]])
		}
		sortable.sort((a, b) => b[1] - a[1])

		// preview if needed
		if (detailedInfo) {
			console.log(
				'Detailed items pick-rate: ',
				sortable.slice(0, numberOfItemsToDisplay),
			)
		}

		// return top N items only
		return sortable.slice(0, numberOfItemsToDisplay).map(e => e[0])
	}
	return getTop(10, isNeededDetails)
}
task(1000, true).then(
	res => {
		console.log('Result: ', res)
	},
	err => {
		console.log('Error: ', err)
	},
)
