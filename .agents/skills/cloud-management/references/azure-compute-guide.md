# Azure Compute Guide

Use this when the task is Azure VM sizing, VM Scale Sets, connectivity troubleshooting, or capacity reservation decisions.

## Route the Task First

- Recommendation, compare, or price a compute shape: sizing workflow
- RDP, SSH, unreachable VM, or boot issue: connectivity troubleshooting
- guaranteed capacity or reservation planning: capacity reservation workflow
- if the user really wants managed containers, Functions, or Container Apps, route back to the simpler managed-runtime path instead of forcing VMs

## Sizing Workflow

Collect:

- workload type: general, compute-heavy, memory-heavy, GPU, database, bursty dev/test
- scaling needs: single instance, fixed fleet, autoscale
- statefulness: stateless frontends versus pets
- region, budget, and availability expectations

Useful commands:

```bash
az vm list-skus --location <region> --resource-type virtualMachines -o table
az vm list-vm-resize-options -g <rg> -n <vm> -o table
az vmss list -g <rg> -o table
```

Recommendation rules:

- choose VMSS when autoscaling or fleet consistency matters
- choose standalone VM only when stateful or low-scale control is the real requirement
- for dev/test, prefer burstable or smaller general-purpose shapes
- for HA, call out zone, disk, and load-balancer implications explicitly

## Connectivity Troubleshooting

Start with:

```bash
az vm show -g <rg> -n <vm> -d
az vm get-instance-view -g <rg> -n <vm>
az network nsg list -g <rg> -o table
az network watcher test-connectivity --source-resource <source-id> --dest-resource <dest-id>
```

Then inspect:

- NSG and firewall rules
- public IP and private NIC bindings
- boot diagnostics and serial console evidence
- guest agent health and credential-reset posture

## Capacity Reservations

When the user needs guaranteed capacity:

```bash
az capacity reservation group list -g <rg> -o table
az capacity reservation list -g <rg> --reservation-group <group>
```

Call out the cost of reserved but unused capacity, and ask before creating or expanding reservations.
