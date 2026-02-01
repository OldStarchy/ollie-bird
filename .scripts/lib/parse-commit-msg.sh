## Version: 1.0.0
## Source: https://github.com/OldStarchy/shared_scripts
## Usage: . .scripts/parse-commit-msg.sh
##
## This provides a conventional commit message parser


VALID_TYPES=("build" "chore" "ci" "docs" "feat" "fix" "perf" "refactor" "revert" "style" "test" "wip")

## Parses a commit message as conventional commit.
## Returns non-zero if the given message is not formatted correctly and echo's
## to stderr any parse errors.
##
## Usage:
##   parse_commit_msg <commit_msg> <subject_out> <body_out> <footer_out> <bypass_out>
##
## Example: echoing just the body of a message
##
## ```bash
## commit_msg=$(< "$1")
##
## body=() # Default value if there is no body
##
## parse_commit_msg "$commit_msg" _subject body _footer _bypass
##
## if [[ $? -ne 0 ]]; then
## 	echo "invalid commit message"
## 	exit 1
## fi
##
## echo "${body[@]}"
## ```
parse_commit_msg() {
	local commit_msg="$1"
	local -n _subject_out="$2"
	local -n _body_out="$3"
	local -n _footer_out="$4"
	local -n _bypass_out="$5"
	local lines=()

	readarray -t lines <<< "$commit_msg"

	local subject="${lines[0]}"

	if [[ "$subject" =~ ^(fixup|squash)!\  ]]; then
		_bypass_out=true
		return 0
	fi

	if [[ "$subject" =~ ^(Merge|Revert)\  ]]; then
		_bypass_out=true
		return 0
	fi

	if [[ ! "$subject" =~ ^([a-z]+)(\([^\ \)]+\))?!?:\ .+$ ]]; then
		echo "Subject line doesn't match \"type(subject): description\""
		return 1
	fi

	local type=$(echo "$subject" | sed -E 's/^([a-z]+).*$/\1/')
	if [[ ! " ${VALID_TYPES[*]} " =~ " $type " ]]; then
		echo "Invalid commit type '$type'"
		echo " Allowed types: ${VALID_TYPES[*]}"
		return 1
	fi

	if [[ "${#lines[@]}" -gt 1 ]]; then
		if [[ -n "${lines[1]}" && ! "${lines[1]}" =~ ^# ]]; then
			echo "Line following subject must be empty or start with #"
			return 1
		fi
	fi


	local buffer=()
	local found_non_footer_line=false

	local body_lines=()
	local footer_lines=()

	local have_body=false
	local have_footer=false

	local was_empty=true

	take_buffer() {
		if [[ "${buffer[0]}" =~ ^[^:]+:\ .+ ]]; then
			is_footer=true
		else
			is_footer=false
		fi

		if $is_footer || $have_body; then
			footer_lines=("${buffer[@]}")
			have_footer=true
			buffer=()
		else
			body_lines+=("${buffer[@]}")
			have_body=true
			buffer=()
		fi
	}

	for ((i=2; i<${#lines[@]}; i++)); do
		local line="${lines[i]}"

		if [[ "$line" == \#* ]]; then
			continue
		fi

		if [[ -z "$line" ]]; then
			if $was_empty; then
				echo "Too many blank lines at line $i"
				return 1
			fi
			was_empty=true

			take_buffer

			continue
		fi
		was_empty=false

		if $have_footer; then
			echo "Found extra lines after footer"
			return 1
		fi

		buffer+=("$line")

		if [[ "${#line}" -gt 72 ]]; then
			echo "WARNING: line $i exceeds 72 characters" >&2
		fi
	done

	if [[ "${#buffer[@]}" -gt 0 ]]; then
		take_buffer
	fi

	unset -f take_buffer

	for footer in "${footer_lines[@]}"; do
		if [[ ! "$footer" =~ ^[^:]+:\ .+ ]]; then
			echo "Invalid footer line: '$footer'"
			return 1
		fi
	done

	_subject_out="$subject"
	_body_out=("${body_lines[@]}")
	_footer_out=("${footer_lines[@]}")
	_bypass_out=false

	return 0
}
