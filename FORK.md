# Fork Information

This repository is a fork of the original OpenSkills project with enhancements.

## Original Repository

- **Original Project:** [numman-ali/openskills](https://github.com/numman-ali/openskills)
- **Original Author:** Numman Ali ([@nummanali](https://x.com/nummanali))
- **License:** Apache License 2.0
- **Original Purpose:** Universal skills loader for AI coding agents

## This Fork

- **Fork Repository:** [didierhk/openskills](https://github.com/didierhk/openskills)
- **Fork Maintainer:** Didier HK
- **Fork Purpose:** Enhanced version with additional features and improvements

## Enhancements in This Fork

See [ENHANCEMENTS.md](./ENHANCEMENTS.md) for a comprehensive list of improvements:

1. **Code Quality Tooling**
   - ESLint and Prettier configuration
   - Automated formatting and linting checks
   - Enhanced CI/CD pipeline with code quality gates

2. **Runtime Validation & Security**
   - Zod-based schema validation for SKILL.md frontmatter
   - Path traversal prevention
   - Input sanitization and validation
   - Comprehensive security test suite

3. **New Features**
   - `openskills update` command for updating git-based skills
   - Skill metadata tracking
   - Enhanced error messages and user feedback

4. **Developer Experience**
   - Comprehensive test coverage
   - Better documentation
   - Improved .gitignore
   - Coverage reporting with Codecov

## Relationship to Original

This fork:
- ✅ Maintains full compatibility with the original OpenSkills
- ✅ Preserves all original functionality
- ✅ Follows Apache 2.0 license terms
- ✅ Properly attributes the original author
- ✅ Can sync with upstream changes

## Syncing with Upstream

To keep this fork updated with the original repository:

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream changes into your branch
git merge upstream/main

# Push updated code to your fork
git push origin main
```

## Contributing

Contributions to this fork are welcome! Please:

1. Follow the code quality standards (ESLint, Prettier)
2. Add tests for new features
3. Update documentation as needed
4. Run `npm run validate` before submitting PRs

For contributions to the **original project**, please visit:
https://github.com/numman-ali/openskills

## License Compliance

This fork complies with the Apache 2.0 license:

- ✅ Original license file retained (LICENSE)
- ✅ Copyright notices preserved
- ✅ Attribution provided (NOTICE file)
- ✅ Modifications documented (ENHANCEMENTS.md)
- ✅ Same license applied to derivative work

## Support

- **For issues specific to this fork:** Open an issue in [didierhk/openskills](https://github.com/didierhk/openskills/issues)
- **For original OpenSkills issues:** Open an issue in [numman-ali/openskills](https://github.com/numman-ali/openskills/issues)

## Acknowledgments

Special thanks to:
- **Numman Ali** ([@nummanali](https://x.com/nummanali)) for creating the original OpenSkills project
- **Anthropic** for the Claude Code skills system that inspired this project
- All OpenSkills contributors from the original repository

---

**Last Updated:** 2026-01-07
