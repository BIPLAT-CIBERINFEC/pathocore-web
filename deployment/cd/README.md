# Continuous deployment on the development host

Pull-based deployment of PathoCore Web and PathoCore API on the development VM
(`mepram-des-*.ciberisciii.es`). A systemd timer runs `scripts/deploy_dev.sh`
every 10 minutes. On each run the script:

1. Locks the run, so two deployments never overlap.
2. Checks that tracked files are unchanged in `pathocore-web` and `pathocore-api`.
3. Fetches `dev` (Web) and `develop` (API) from the official `BIPLAT-CIBERINFEC` remotes.
4. Deploys only when every GitHub check run of both target commits is completed and green. The checks are read through the public GitHub API, with no token.
5. Checks out both target commits (detached) and runs `container_install.sh --test --action upgrade --engine docker --git_revision current` from `pathocore-web`:
   - images are rebuilt and the stack is recreated;
   - migrations and bootstrap run;
   - no data is imported and volumes are kept;
   - the smoke test runs at the end.
6. Checks `DEPLOY_HEALTH_URLS` through the public hostnames.
7. If the upgrade or a health check fails, it checks the previous commits out again and repeats the upgrade.

MePRAM OMOP API is not touched: update its checkout by hand, in agreement with its maintainer.

## Why pull-based

The repositories are public. A self-hosted GitHub runner on the VM could run workflow code from pull requests opened by others. With a pull-based timer, the VM only runs code that has been merged into the official branches and has passed CI. Approving a deployment is the same as merging the pull request.

## Install (once, with sudo)

```bash
# 1. The checkouts must be Git clones with the official remote:
git -C /opt/container_apps/pathocore-web remote -v   # github.com/BIPLAT-CIBERINFEC/pathocore-web
git -C /opt/container_apps/pathocore-api remote -v   # github.com/BIPLAT-CIBERINFEC/pathocore-api
# 2. Try it by hand first:
/opt/container_apps/pathocore-web/scripts/deploy_dev.sh --dry-run
# 3. Configuration and units (from the web checkout):
cd /opt/container_apps/pathocore-web
sudo install -m 0644 deployment/cd/pathocore-deploy-dev.env.example /etc/pathocore-deploy-dev.env
sudo install -m 0644 deployment/cd/pathocore-deploy-dev.service deployment/cd/pathocore-deploy-dev.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pathocore-deploy-dev.timer
```

The service runs as `bioinfoadm`, never as root. That account must own `/opt/container_apps` and be able to use the container engine. Membership of the `docker` group is equivalent to root on the host, so do not give that account to anyone else.

## Operate

| Task | Command |
|---|---|
| Next and last runs | `systemctl list-timers pathocore-deploy-dev.timer` |
| Logs | `journalctl -u pathocore-deploy-dev.service -n 200` |
| Deployment history | `~bioinfoadm/.local/state/pathocore-deploy/deployments.log` |
| Pause deployments | `sudo systemctl stop pathocore-deploy-dev.timer` |
| Deploy now | `sudo systemctl start pathocore-deploy-dev.service` |
| Redeploy the same commits | `deploy_dev.sh --force` |

Before working by hand in the checkouts (for example to update MePRAM or to test a branch), pause the timer. After a deployment the checkouts are in detached HEAD. That is expected: the script compares commits, not branch names.

Not covered yet: production (it will use release tags, a database backup before each upgrade and two approvals), and reporting the deployment result back to GitHub.
