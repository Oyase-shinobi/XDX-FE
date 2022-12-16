import { DeployFunction } from "hardhat-deploy/types";
import {
  StakedXlxMigrator__factory,
  StakedXlx__factory,
  Timelock__factory,
  XlxManager__factory,
  XLX__factory,
} from "../../types";
import { Ship } from "../../utils";

const func: DeployFunction = async (hre) => {
  const { deploy, connect } = await Ship.init(hre);

  const xlx = await connect(XLX__factory);
  const xlxManager = await connect(XlxManager__factory);
  const stakedXlxTracker = await connect(StakedXlxMigrator__factory);
  const feeXlxTracker = await connect("FeeXlxTracker");
  const timelock = await connect(Timelock__factory, await stakedXlxTracker.gov());

  const stakedXlx = await deploy(StakedXlx__factory, {
    args: [xlx.address, xlxManager.address, stakedXlxTracker.address, feeXlxTracker.address],
  });

  if (stakedXlx.newlyDeployed) {
    await timelock.signalSetHandler(stakedXlxTracker.address, stakedXlx.address, true);
    await timelock.signalSetHandler(feeXlxTracker.address, stakedXlx.address, true);
  }
};

export default func;
func.tags = ["stakedXlx"];
func.dependencies = ["xlx", "xlxManager", "stakedXlxTracker", "feeXlxTracker", "timelock"];
